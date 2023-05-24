import { ButtonGroup, Flex, Text } from '@chakra-ui/react'
import ClosePositionIcon from '@public/icons/closePositionIcon.svg'
import React from 'react'

import { AssetIconWithText } from '@/components/shared/components'
import { useMarketContext } from '@/contexts/marketContext'
import { FormState, useTradeFormState } from '@/contexts/tradeFormContext'

import { Button } from '@ds/Button'
import { DataRow } from '@ds/DataRow'

import { OrderSide } from '../../TradeForm/constants'
import { PositionStatus } from '../constants'
import { useFormatPosition, usePositionManagerCopy, useStyles } from '../hooks'
import {
  ActivePositionDetail,
  ActivePositionHeader,
  DesktopButtonContainer,
  HiddenOnLargeScreen,
  LeftContainer,
  LeverageBadge,
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
  const {
    side,
    currentCollateral,
    position,
    averageEntry,
    liquidationPrice,
    notional,
    leverage,
    pnl,
    pnlPercentage,
    isPnlPositive,
    dailyFunding,
    status,
  } = useFormatPosition()

  const hasPosition = position !== noValue
  const pnlTextColor = isPnlPositive ? green : red
  const sideTextColor = side === OrderSide.Long ? green : red
  const isOpenPosition =
    status === PositionStatus.open || status === PositionStatus.pricing || status === PositionStatus.closing
  const isClosedPosition = status === PositionStatus.closed

  const statusLabel = copy[status]
  return (
    <ResponsiveContainer>
      <LeftContainer borderColor={borderColor}>
        <Flex width="50%" flexDirection="column" borderRight={`1px solid ${borderColor}`}>
          <ActivePositionHeader borderColor={borderColor}>
            <AssetIconWithText market={assetMetadata} text={statusLabel} />
            <StatusLight color={isOpenPosition ? green : 'darkGray'} glow={isOpenPosition} />
          </ActivePositionHeader>
          <ActivePositionDetail
            label={copy.size}
            value={isOpenPosition ? position : noValue}
            valueSubheader={isOpenPosition ? notional : noValue}
          />
        </Flex>
        <Flex width="50%" flexDirection="column">
          <ActivePositionHeader borderColor={borderColor}>
            <Text fontSize="17px" color={isOpenPosition ? sideTextColor : subheaderTextColor}>
              {side}
            </Text>
            <LeverageBadge leverage={leverage} />
          </ActivePositionHeader>
          <ActivePositionDetail
            label={copy.pnl}
            value={pnlPercentage}
            valueSubheader={pnl}
            valueColor={hasPosition ? pnlTextColor : subheaderTextColor}
          />
        </Flex>
      </LeftContainer>
      <RightContainer>
        <HiddenOnLargeScreen>
          {hasPosition && (
            <Flex flex={1} justifyContent="space-between" mb="10px" alignItems="center">
              <Flex alignItems="center">
                <Text mr={3}>{statusLabel}</Text>
                <StatusLight color={hasPosition ? green : 'darkGray'} glow={hasPosition} />
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
              {isClosedPosition && (
                <Button size="sm" label={copy.withdraw} onClick={() => setTradeFormState(FormState.withdraw)} />
              )}
            </Flex>
          )}

          <DataRow
            label={copy.side}
            value={
              <Text fontSize="14px" color={sideTextColor}>
                {side}
              </Text>
            }
          />
          <DataRow
            label={copy.size}
            value={
              <Text fontSize="14px" color={alpha75}>
                {/*eslint-disable-next-line formatjs/no-literal-string-in-jsx */}
                {isOpenPosition ? `${position} / {notional}` : noValue}
              </Text>
            }
          />
          <DataRow
            label={copy.pnl}
            value={
              <Text fontSize="14px" color={pnlTextColor}>
                {/*eslint-disable-next-line formatjs/no-literal-string-in-jsx */}
                {pnlPercentage} / {pnl}
              </Text>
            }
          />
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
          label={copy.yourAverageEntry}
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
            {isClosedPosition && (
              <Button size="sm" label={copy.withdraw} onClick={() => setTradeFormState(FormState.withdraw)} />
            )}
          </DesktopButtonContainer>
        )}
      </RightContainer>
    </ResponsiveContainer>
  )
}

export default CurrentPosition
