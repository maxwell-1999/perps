import { ButtonGroup, Flex, Text } from '@chakra-ui/react'
import ClosePositionIcon from '@public/icons/closePositionIcon.svg'
import React from 'react'

import { TooltipIcon } from '@/components/design-system/Tooltip'
import { AssetIconWithText } from '@/components/shared/components'
import { OrderDirection, PositionStatus } from '@/constants/markets'
import { useMarketContext } from '@/contexts/marketContext'
import { FormState, useTradeFormState } from '@/contexts/tradeFormContext'
import { PositionDetails } from '@/hooks/markets'

import { Button } from '@ds/Button'
import { DataRow } from '@ds/DataRow'

import { getStatusDetails } from '@utils/positionUtils'

import { useFormatPosition, usePositionManagerCopy, useStyles } from '../hooks'
import {
  ActivePositionDetail,
  ActivePositionHeader,
  DesktopButtonContainer,
  FundingRateTooltip,
  HiddenOnLargeScreen,
  LeftContainer,
  LeverageBadge,
  PnlDataRow,
  PnlPositionDetail,
  ResponsiveContainer,
  RightContainer,
  StatusLight,
} from './components'

function CurrentPosition() {
  const copy = usePositionManagerCopy()
  const { noValue } = copy
  const { borderColor, green, red, alpha75, subheaderTextColor, alpha50 } = useStyles()
  const { assetMetadata, isMaker } = useMarketContext()
  const { setTradeFormState } = useTradeFormState()
  const { positionDetails, formattedValues } = useFormatPosition()
  const {
    direction,
    dailyFunding,
    hourlyFunding,
    eightHourFunding,
    yearlyFundingRate,
    currentCollateral,
    nextPosition,
    averageEntry,
    liquidationPrice,
    nextNotional,
    nextLeverage,
    liquidationFee,
    makerExposure,
    fundingFeeAPR,
    tradingFeeAPR,
    totalAPR,
  } = formattedValues
  const status = positionDetails?.status ?? PositionStatus.resolved

  const hasPosition = status !== PositionStatus.resolved
  const liquidated = !!positionDetails?.liquidations?.length
  const directionTextColor = direction === OrderDirection.Long ? green : red
  const { isOpenPosition, statusColor } = getStatusDetails(status, liquidated)

  const statusLabel = liquidated ? copy.liquidated : copy[status]
  return (
    <ResponsiveContainer>
      <LeftContainer borderColor={borderColor}>
        <Flex width="50%" flexDirection="column" borderRight={`1px solid ${borderColor}`}>
          <ActivePositionHeader borderColor={borderColor}>
            <AssetIconWithText
              market={assetMetadata}
              text={assetMetadata.baseCurrency.toUpperCase()}
              textProps={{ fontSize: '15px', textTransform: 'capitalize' }}
            />
            <Flex alignItems="center" gap="12px">
              <Text fontSize="15px">{statusLabel}</Text> <StatusLight color={statusColor} glow={isOpenPosition} />
            </Flex>
          </ActivePositionHeader>
          <ActivePositionDetail
            label={copy.size}
            value={isOpenPosition ? nextPosition : noValue}
            valueSubheader={isOpenPosition ? nextNotional : copy.noPositionOpen}
            valueColor={isOpenPosition ? 'initial' : subheaderTextColor}
          />
        </Flex>
        <Flex width="50%" flexDirection="column">
          <ActivePositionHeader borderColor={borderColor}>
            <Text fontSize="17px" color={isOpenPosition ? directionTextColor : subheaderTextColor}>
              {direction}
            </Text>
            {hasPosition ? (
              <LeverageBadge leverage={nextLeverage} />
            ) : (
              <Text variant="label" fontSize="15px">
                {noValue}
              </Text>
            )}
          </ActivePositionHeader>
          {hasPosition ? (
            <PnlPositionDetail positionDetails={positionDetails as PositionDetails} />
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
                    onClick={() => setTradeFormState(FormState.close)}
                  />
                </ButtonGroup>
              )}
            </Flex>
          )}

          <DataRow
            label={copy.direction}
            value={
              <Text fontSize="14px" color={directionTextColor}>
                {direction}
              </Text>
            }
          />
          <DataRow
            label={copy.size}
            value={
              <Text fontSize="14px" color={alpha75}>
                {/*eslint-disable-next-line formatjs/no-literal-string-in-jsx */}
                {isOpenPosition ? `${nextPosition} / ${nextNotional}` : noValue}
              </Text>
            }
          />
          {hasPosition ? (
            <PnlDataRow positionDetails={positionDetails as PositionDetails} />
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
              label={copy.currentExposure}
              value={
                <Text fontSize="14px" color={alpha75}>
                  {hasPosition ? makerExposure : noValue}
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
        <DataRow
          label={copy.averageEntry}
          value={
            <Text fontSize="14px" color={alpha75}>
              {hasPosition ? averageEntry : noValue}
            </Text>
          }
        />
        {!isMaker && (
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
        )}
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
                  isLoading={status === PositionStatus.closing}
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
