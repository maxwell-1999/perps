import { ButtonGroup, Flex, Text } from '@chakra-ui/react'
import ClosePositionIcon from '@public/icons/closePositionIcon.svg'
import React from 'react'

// import { AssetMetadata, SupportedAsset } from "@/constants/assets";
import { AssetIconWithText } from '@/components/shared/components'
import { useMarketContext } from '@/contexts/marketContext'
import { FormState, useTradeFormState } from '@/contexts/tradeFormContext'

import { Button } from '@ds/Button'
import { DataRow } from '@ds/DataRow'

import { usePositionManagerCopy, useStyles } from '../hooks'
import {
  ActivePositionDetail,
  ActivePositionHeader,
  LeftContainer,
  LeverageBadge,
  ResponsiveContainer,
  RightContainer,
  StatusLight,
} from './components'

const dummyData = {
  isLong: true,
  leverageValue: '5',
  size: '0.500',
  sizeNotional: '2,402.23',
  pnL: '3.12%',
  pnLNotional: '2,402.23',
  isPositive: true,
}

function CurrentPosition() {
  const copy = usePositionManagerCopy()
  const { borderColor, green, red, alpha75 } = useStyles()
  const { assetMetadata } = useMarketContext()
  const { setTradeFormState } = useTradeFormState()

  return (
    <ResponsiveContainer>
      <LeftContainer borderColor={borderColor}>
        <Flex width="50%" flexDirection="column" borderRight={`1px solid ${borderColor}`}>
          <ActivePositionHeader borderColor={borderColor}>
            <AssetIconWithText market={assetMetadata} text={copy.open} />
            <StatusLight color={green} />
          </ActivePositionHeader>
          <ActivePositionDetail label={copy.size} value={dummyData.size} valueSubheader={dummyData.sizeNotional} />
        </Flex>
        <Flex width="50%" flexDirection="column">
          <ActivePositionHeader borderColor={borderColor}>
            <Text fontSize="17px" color={dummyData.isLong ? green : red}>
              {copy.long}
            </Text>
            <LeverageBadge leverage={dummyData.leverageValue} />
          </ActivePositionHeader>
          <ActivePositionDetail
            label={copy.pnl}
            value={dummyData.pnL}
            valueSubheader={dummyData.pnLNotional}
            valueColor={dummyData.isPositive ? green : red}
          />
        </Flex>
      </LeftContainer>
      <RightContainer>
        <DataRow
          label={copy.liquidationPrice}
          value={
            <Text fontSize="14px" color={alpha75}>
              {dummyData.pnLNotional}
            </Text>
          }
        />
        <DataRow
          label={copy.yourAverageEntry}
          value={
            <Text fontSize="14px" color={alpha75}>
              {dummyData.pnLNotional}
            </Text>
          }
        />
        <DataRow
          label={copy.dailyFundingRate}
          value={
            <Text fontSize="14px" color={alpha75}>
              {dummyData.pnLNotional}
            </Text>
          }
        />
        <DataRow
          label={copy.collateral}
          value={
            <Text fontSize="14px" color={alpha75}>
              {dummyData.pnLNotional}
            </Text>
          }
        />
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
      </RightContainer>
    </ResponsiveContainer>
  )
}

export default CurrentPosition
