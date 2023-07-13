import { Box, Flex, Text, useColorModeValue } from '@chakra-ui/react'
import { memo } from 'react'

import { ModalDetailContainer } from '@/components/shared/ModalComponents'
import { FormattedBig18, FormattedBig18USDPrice } from '@/components/shared/components'
import { AssetMetadata, SupportedAsset } from '@/constants/assets'
import { OrderDirection } from '@/constants/markets'
import { Big18Math } from '@/utils/big18Utils'

import colors from '@ds/theme/colors'

import { ProductSnapshot } from '@t/perennial'

import { calcPositionFee } from '../../utils'
import { useAdjustmentModalCopy } from './hooks'

const PositionValueDisplay = ({
  title,
  newValue,
  prevValue,
  usd,
  asset,
  leverage,
}: {
  title: string
  newValue: bigint | string
  prevValue?: bigint
  usd?: boolean
  leverage?: boolean
  asset?: SupportedAsset
  isLast?: boolean
}) => {
  const previousColor = useColorModeValue(colors.brand.blackAlpha[50], colors.brand.whiteAlpha[50])

  return (
    <Flex alignItems="center" justifyContent="space-between">
      <Text variant="label" fontSize="13px">
        {title}
      </Text>
      <Flex alignItems="center">
        {prevValue !== undefined && (
          <>
            <Flex mr={1} alignItems="center">
              {!!usd ? (
                <FormattedBig18USDPrice fontSize="14px" color={previousColor} value={prevValue} />
              ) : (
                <FormattedBig18
                  fontSize="14px"
                  color={previousColor}
                  value={prevValue}
                  asset={asset}
                  leverage={leverage}
                />
              )}
              <Text ml={1} color={previousColor} fontSize="14px">
                {/* eslint-disable formatjs/no-literal-string-in-jsx */}→
              </Text>
            </Flex>
          </>
        )}
        <Box>
          {typeof newValue === 'string' ? (
            <Text fontSize="14px">{newValue}</Text>
          ) : !!usd ? (
            <FormattedBig18USDPrice fontSize="14px" value={newValue} />
          ) : (
            <FormattedBig18 fontSize="14px" value={newValue} asset={asset} leverage={leverage} />
          )}
        </Box>
      </Flex>
    </Flex>
  )
}

interface PositionInfoProps {
  newCollateral: bigint
  prevCollateral: bigint
  newLeverage: bigint
  prevLeverage: bigint
  newPosition: bigint
  prevPosition: bigint
  positionDelta?: bigint
  asset: SupportedAsset
  isPrevious?: boolean
  orderDirection: OrderDirection
  product: ProductSnapshot
  frozen: boolean
}

export const PositionInfo = memo(
  function PositionInfo({
    newCollateral,
    newLeverage,
    newPosition,
    prevCollateral,
    prevLeverage,
    prevPosition,
    positionDelta,
    asset,
    product,
    orderDirection,
  }: PositionInfoProps) {
    const copy = useAdjustmentModalCopy()

    const {
      latestVersion: { price },
      productInfo: { takerFee },
    } = product

    const previousNotional = Big18Math.mul(prevPosition, Big18Math.abs(price))
    const newNotional = Big18Math.mul(newPosition, Big18Math.abs(price))
    const { quoteCurrency } = AssetMetadata[asset]

    return (
      <ModalDetailContainer>
        <PositionValueDisplay
          title={copy.side}
          newValue={orderDirection === OrderDirection.Long ? copy.long : copy.short}
        />
        <PositionValueDisplay
          title={copy.positionSizeAsset(asset)}
          newValue={newPosition}
          prevValue={prevPosition}
          asset={asset}
        />
        <PositionValueDisplay
          title={copy.positionSizeAsset(quoteCurrency)}
          newValue={newNotional}
          prevValue={previousNotional}
          usd
        />
        <PositionValueDisplay title={copy.collateral} newValue={newCollateral} prevValue={prevCollateral} usd />
        <PositionValueDisplay title={copy.leverage} newValue={newLeverage} prevValue={prevLeverage} leverage isLast />
        {positionDelta !== undefined && (
          <PositionValueDisplay title={copy.fees} newValue={calcPositionFee(price, positionDelta, takerFee)} usd />
        )}
      </ModalDetailContainer>
    )
  },
  ({ frozen: preFrozen }, { frozen }) => frozen && preFrozen, // Force no re-renders based on prop changes if marked as frozen
)
