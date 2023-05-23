import { ButtonGroup, Flex, Text } from '@chakra-ui/react'
import ClosePositionIcon from '@public/icons/closePositionIcon.svg'
import React from 'react'

import { AssetIconWithText } from '@/components/shared/components'
import { useMarketContext } from '@/contexts/marketContext'
import { FormState, useTradeFormState } from '@/contexts/tradeFormContext'

import { Button } from '@ds/Button'
import { DataRow } from '@ds/DataRow'

import { OrderSide } from '../../TradeForm/constants'
import { useFormatPosition, usePositionManagerCopy, useStyles } from '../hooks'
import {
  ActivePositionDetail,
  ActivePositionHeader,
  LeftContainer,
  LeverageBadge,
  ResponsiveContainer,
  RightContainer,
  StatusLight,
} from './components'

function CurrentPosition() {
  const copy = usePositionManagerCopy()
  const { borderColor, green, red, alpha75, subheaderTextColor } = useStyles()
  const { assetMetadata } = useMarketContext()
  const { setTradeFormState } = useTradeFormState()
  const formattedPosition = useFormatPosition()

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
  } = formattedPosition

  const hasPosition = position !== copy.noValue

  return (
    <ResponsiveContainer>
      <LeftContainer borderColor={borderColor}>
        <Flex width="50%" flexDirection="column" borderRight={`1px solid ${borderColor}`}>
          <ActivePositionHeader borderColor={borderColor}>
            <AssetIconWithText market={assetMetadata} text={hasPosition ? copy.open : copy.noValue} />
            <StatusLight color={hasPosition ? green : 'darkGray'} glow={hasPosition} />
          </ActivePositionHeader>
          <ActivePositionDetail label={copy.size} value={position} valueSubheader={notional} />
        </Flex>
        <Flex width="50%" flexDirection="column">
          <ActivePositionHeader borderColor={borderColor}>
            <Text fontSize="17px" color={hasPosition ? (side === OrderSide.Long ? green : red) : subheaderTextColor}>
              {side}
            </Text>
            <LeverageBadge leverage={leverage} />
          </ActivePositionHeader>
          <ActivePositionDetail
            label={copy.pnl}
            value={pnlPercentage}
            valueSubheader={pnl}
            valueColor={hasPosition ? (isPnlPositive ? green : red) : subheaderTextColor}
          />
        </Flex>
      </LeftContainer>
      <RightContainer>
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
              {copy.noValue}
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
        {formattedPosition.position !== copy.noValue && (
          <Flex flex={1} justifyContent="flex-end" pt={'10px'}>
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
          </Flex>
        )}
      </RightContainer>
    </ResponsiveContainer>
  )
}

export default CurrentPosition
