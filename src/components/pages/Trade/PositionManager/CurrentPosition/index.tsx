import { ButtonGroup, Flex, Text } from '@chakra-ui/react'
import ClosePositionIcon from '@public/icons/closePositionIcon.svg'
import React from 'react'

import { AssetIconWithText } from '@/components/shared/components'
import { OrderDirection, PositionStatus } from '@/constants/markets'
import { useMarketContext } from '@/contexts/marketContext'
import { FormState, useTradeFormState } from '@/contexts/tradeFormContext'
import { PositionDetails } from '@/hooks/markets'

import { Button } from '@ds/Button'
import { DataRow } from '@ds/DataRow'

import { useFormatPosition, usePositionManagerCopy, useStyles } from '../hooks'
import {
  ActivePositionDetail,
  ActivePositionHeader,
  DesktopButtonContainer,
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
  const { borderColor, green, red, alpha75, subheaderTextColor } = useStyles()
  const { assetMetadata } = useMarketContext()
  const { setTradeFormState } = useTradeFormState()
  const { positionDetails, formattedValues } = useFormatPosition()
  const {
    direction,
    dailyFunding,
    currentCollateral,
    nextPosition,
    averageEntry,
    liquidationPrice,
    nextNotional,
    leverage,
  } = formattedValues
  const status = positionDetails?.status ?? PositionStatus.resolved

  const hasPosition = status !== PositionStatus.resolved
  const directionTextColor = direction === OrderDirection.Long ? green : red
  const isOpenPosition =
    status === PositionStatus.open ||
    status === PositionStatus.pricing ||
    status === PositionStatus.closing ||
    status === PositionStatus.opening
  const isTransitionPosition =
    status === PositionStatus.pricing || status === PositionStatus.opening || status === PositionStatus.closing
  const statusColor = isOpenPosition ? (isTransitionPosition ? 'goldenRod' : green) : 'darkGray'

  const statusLabel = copy[status]
  return (
    <ResponsiveContainer>
      <LeftContainer borderColor={borderColor}>
        <Flex width="50%" flexDirection="column" borderRight={`1px solid ${borderColor}`}>
          <ActivePositionHeader borderColor={borderColor}>
            <AssetIconWithText market={assetMetadata} text={statusLabel} />
            <StatusLight color={statusColor} glow={isOpenPosition} />
          </ActivePositionHeader>
          <ActivePositionDetail
            label={copy.size}
            value={isOpenPosition ? nextPosition : noValue}
            valueSubheader={isOpenPosition ? nextNotional : noValue}
            valueColor={isOpenPosition ? 'initial' : subheaderTextColor}
          />
        </Flex>
        <Flex width="50%" flexDirection="column">
          <ActivePositionHeader borderColor={borderColor}>
            <Text fontSize="17px" color={isOpenPosition ? directionTextColor : subheaderTextColor}>
              {direction}
            </Text>
            <LeverageBadge leverage={leverage} />
          </ActivePositionHeader>
          {hasPosition ? (
            <PnlPositionDetail positionDetails={positionDetails as PositionDetails} />
          ) : (
            <ActivePositionDetail
              label={copy.pnl}
              value={noValue}
              valueSubheader={noValue}
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
                  <Button size="sm" label={copy.modify} onClick={() => setTradeFormState(FormState.modify)} />
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
        <DataRow
          label={copy.liquidationPrice}
          value={
            <Text fontSize="14px" color={alpha75}>
              {liquidationPrice}
            </Text>
          }
        />
        <DataRow
          label={copy.averageEntry}
          value={
            <Text fontSize="14px" color={alpha75}>
              {averageEntry}
            </Text>
          }
        />
        <DataRow
          label={copy.dailyFundingRate}
          value={
            <Text fontSize="14px" color={alpha75}>
              {dailyFunding}
            </Text>
          }
        />
        <DataRow
          label={copy.collateral}
          value={
            <Text fontSize="14px" color={alpha75}>
              {currentCollateral}
            </Text>
          }
        />
        {hasPosition && (
          <DesktopButtonContainer>
            {isOpenPosition && (
              <ButtonGroup>
                <Button size="sm" label={copy.modify} onClick={() => setTradeFormState(FormState.modify)} />
                <Button
                  size="sm"
                  leftIcon={<ClosePositionIcon />}
                  variant="transparent"
                  label={copy.close}
                  onClick={() => setTradeFormState(FormState.close)}
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
