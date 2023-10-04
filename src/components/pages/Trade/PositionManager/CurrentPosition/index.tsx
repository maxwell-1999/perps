import { ButtonGroup, Flex, Text, useBreakpointValue } from '@chakra-ui/react'
import ClosePositionIcon from '@public/icons/closePositionIcon.svg'
import React from 'react'

import { TooltipIcon } from '@/components/design-system/Tooltip'
import { AssetIconWithText } from '@/components/shared/components'
import { PositionSide2 } from '@/constants/markets'
import { useMarketContext } from '@/contexts/marketContext'
import { FormState, useTradeFormState } from '@/contexts/tradeFormContext'
import { useActivePositionMarketPnls } from '@/hooks/markets2'

import { Button } from '@ds/Button'
import { DataRow } from '@ds/DataRow'

import { getStatusDetails, isFailedClose } from '@utils/positionUtils'

import { useFormatPosition, usePositionManagerCopy, useStyles } from '../hooks'
import {
  ActivePositionDetail,
  ActivePositionHeader,
  AverageEntryRow,
  DesktopButtonContainer,
  FundingRateTooltip,
  HiddenOnLargeScreen,
  LeftContainer,
  LeverageBadge,
  PnlPositionDetail,
  ResponsiveContainer,
  RightContainer,
  StatusLight,
} from './components'

function CurrentPosition() {
  const copy = usePositionManagerCopy()
  const { noValue } = copy
  const { borderColor, alpha75, subheaderTextColor, alpha50 } = useStyles()
  const { assetMetadata, isMaker, selectedMarketSnapshot2 } = useMarketContext()
  const { setTradeFormState, setMobileTradeFormOpen } = useTradeFormState()
  const { positionDetails, formattedValues } = useFormatPosition()
  const { data: pnlData } = useActivePositionMarketPnls()
  const isBase = useBreakpointValue({ base: true, sm: false })
  const {
    direction,
    dailyFunding,
    hourlyFunding,
    eightHourFunding,
    yearlyFundingRate,
    currentCollateral,
    nextPosition,
    liquidationPrice,
    notional,
    nextNotional,
    leverage,
    nextLeverage,
    liquidationFee,
    makerExposure,
    exposureSide,
    fundingFeeAPR,
    tradingFeeAPR,
    totalAPR,
    position,
    isOpening,
  } = formattedValues

  const isSocialized =
    position !== noValue && selectedMarketSnapshot2?.isSocialized && direction === selectedMarketSnapshot2.majorSide

  const liquidated = positionDetails ? !!pnlData?.[positionDetails.asset]?.liquidation : false
  const { isOpenPosition, statusColor, status, directionTextColor, hasPosition, isClosing } = getStatusDetails({
    userMarketSnapshot: positionDetails,
    liquidated,
    isMaker,
  })

  const closingOrFailed = isClosing || isFailedClose(positionDetails)

  const statusLabel = liquidated ? copy.liquidated : copy[status]
  const exposure = hasPosition ? `${makerExposure} ${exposureSide}` : noValue
  const displayDirection = hasPosition && direction !== PositionSide2.none ? direction : noValue

  return (
    <ResponsiveContainer>
      <LeftContainer borderColor={borderColor}>
        <Flex width="50%" flexDirection="column" borderRight={`1px solid ${borderColor}`}>
          <ActivePositionHeader borderColor={borderColor}>
            <AssetIconWithText
              market={assetMetadata}
              size="md"
              text={assetMetadata.baseCurrency.toUpperCase()}
              textProps={{ fontSize: { base: '14px', lg: '15px' }, textTransform: 'capitalize' }}
            />
            <Flex alignItems="center" gap="12px">
              <Text fontSize="15px">{statusLabel}</Text>
              <StatusLight color={statusColor} glow={Boolean(hasPosition)} />
            </Flex>
          </ActivePositionHeader>
          <ActivePositionDetail
            label={copy.size}
            value={closingOrFailed ? position : hasPosition ? nextPosition : noValue}
            valueSubheader={closingOrFailed ? notional : hasPosition ? nextNotional : copy.noPositionOpen}
            valueColor={isOpenPosition ? 'initial' : subheaderTextColor}
            showSocializationWarning={isSocialized}
          />
        </Flex>
        <Flex width="50%" flexDirection="column">
          <ActivePositionHeader borderColor={borderColor}>
            <Text
              fontSize="17px"
              color={isOpenPosition ? directionTextColor : subheaderTextColor}
              textTransform="capitalize"
            >
              {displayDirection}
            </Text>
            {hasPosition ? (
              <LeverageBadge leverage={closingOrFailed ? leverage : nextLeverage} />
            ) : (
              <Text variant="label" fontSize="15px">
                {noValue}
              </Text>
            )}
          </ActivePositionHeader>
          {hasPosition && !isOpening ? (
            <PnlPositionDetail />
          ) : (
            <ActivePositionDetail
              label={copy.pnl}
              value={noValue}
              valueSubheader={copy.noPnLToShow}
              valueColor={subheaderTextColor}
            />
          )}
        </Flex>
      </LeftContainer>
      <RightContainer>
        <HiddenOnLargeScreen>
          {hasPosition && (
            <Flex flex={1} justifyContent="space-between" mb="10px" alignItems="center">
              <Flex alignItems="center">
                <Text mr={3}>{statusLabel}</Text>
                <StatusLight color={statusColor} glow={hasPosition} />
              </Flex>
              {isOpenPosition && (
                <ButtonGroup>
                  <Button
                    size="sm"
                    leftIcon={<ClosePositionIcon />}
                    variant="transparent"
                    label={copy.close}
                    onClick={() => {
                      setTradeFormState(FormState.close)
                      if (isBase) {
                        setMobileTradeFormOpen(true)
                      }
                    }}
                  />
                </ButtonGroup>
              )}
            </Flex>
          )}
          <DataRow label={copy.market} value={<Text fontSize="14px">{assetMetadata.symbol.toUpperCase()}</Text>} />
          <DataRow
            label={copy.direction}
            value={
              <Text fontSize="14px" color={directionTextColor}>
                {displayDirection}
              </Text>
            }
          />
          <DataRow
            label={copy.size}
            value={
              <Text fontSize="14px" color={alpha75}>
                {hasPosition
                  ? /*eslint-disable-next-line formatjs/no-literal-string-in-jsx */
                    `${closingOrFailed ? position : nextPosition} / ${closingOrFailed ? notional : nextNotional}`
                  : noValue}
              </Text>
            }
          />
          {hasPosition ? (
            <PnlPositionDetail asDataRow />
          ) : (
            <DataRow
              label={copy.pnl}
              value={
                <Text fontSize="14px">
                  {/*eslint-disable-next-line formatjs/no-literal-string-in-jsx */}
                  {noValue} / {noValue}
                </Text>
              }
            />
          )}
        </HiddenOnLargeScreen>
        {isMaker ? (
          <>
            <DataRow
              label={
                <Flex alignItems="center" gap={2}>
                  <Text variant="label">{copy.totalAPR}</Text>
                  <TooltipIcon
                    height="11px"
                    width="11px"
                    color={alpha50}
                    tooltipText={
                      <Flex pt={2} flexDirection="column">
                        <DataRow
                          label={
                            <Text fontSize="11px" mr={2}>
                              {copy.fundingFeeAPR}
                            </Text>
                          }
                          value={
                            <Text fontSize="12px" color={alpha75}>
                              {hasPosition ? fundingFeeAPR : noValue}
                            </Text>
                          }
                        />
                        <DataRow
                          label={
                            <Text fontSize="11px" mr={2}>
                              {copy.tradingFeeAPR}
                            </Text>
                          }
                          value={
                            <Text fontSize="12px" color={alpha75}>
                              {hasPosition ? tradingFeeAPR : noValue}
                            </Text>
                          }
                        />
                      </Flex>
                    }
                  />
                </Flex>
              }
              value={
                <Text fontSize="14px" color={alpha75}>
                  {hasPosition ? totalAPR : noValue}
                </Text>
              }
            />
            <DataRow
              label={copy.exposure}
              value={
                <Text fontSize="14px" color={alpha75}>
                  {exposure}
                </Text>
              }
            />
          </>
        ) : (
          <DataRow
            label={copy.liquidationPrice}
            value={
              <Text fontSize="14px" color={alpha75}>
                {hasPosition ? liquidationPrice : noValue}
              </Text>
            }
          />
        )}
        {!isMaker && <AverageEntryRow hasPosition={Boolean(hasPosition)} />}
        <DataRow
          label={
            <Flex alignItems="center" gap={2}>
              <Text variant="label">{copy.fundingRate1hr}</Text>
              <TooltipIcon
                height="11px"
                width="11px"
                color={alpha50}
                tooltipText={
                  <FundingRateTooltip
                    dailyFunding={dailyFunding}
                    hourlyFunding={hourlyFunding}
                    yearlyFunding={yearlyFundingRate}
                    eightHourFunding={eightHourFunding}
                  />
                }
              />
            </Flex>
          }
          value={
            <Text fontSize="14px" color={alpha75}>
              {hourlyFunding}
            </Text>
          }
        />

        <DataRow
          label={copy.collateral}
          value={
            <Text fontSize="14px" color={alpha75}>
              {hasPosition ? currentCollateral : noValue}
            </Text>
          }
        />
        {liquidated && (
          <DataRow
            label={copy.liquidationFee}
            value={
              <Text fontSize="14px" color={alpha75}>
                {liquidationFee}
              </Text>
            }
          />
        )}
        {hasPosition && (
          <DesktopButtonContainer>
            {isOpenPosition && (
              <ButtonGroup>
                <Button
                  size="sm"
                  leftIcon={<ClosePositionIcon />}
                  variant="transparent"
                  label={copy.close}
                  onClick={() => setTradeFormState(FormState.close)}
                  isLoading={isClosing}
                  loadingText={copy.closing}
                />
              </ButtonGroup>
            )}
          </DesktopButtonContainer>
        )}
      </RightContainer>
    </ResponsiveContainer>
  )
}

export default CurrentPosition
