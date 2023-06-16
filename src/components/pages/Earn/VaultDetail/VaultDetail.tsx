import { Flex, useColorModeValue } from '@chakra-ui/react'

import { VaultMetadata, VaultSnapshot } from '@/constants/vaults'
import { useChainId } from '@/hooks/network'
import { useVaultUserSnapshot } from '@/hooks/vaults'
import { Big18Math } from '@/utils/big18Utils'
import { add, calcLeverage, next } from '@/utils/positionUtils'

import colors from '@ds/theme/colors'

import { calcExposure } from '../utils'
import { RiskCard, SupportedAssetsSection, VaultDetailTitle } from './components'
import { useVaultDetailCopy } from './hooks'

export default function VaultDetail({ vault }: { vault: VaultSnapshot }) {
  const copy = useVaultDetailCopy()
  const chainId = useChainId()
  const { symbol, name, longUserSnapshot, shortUserSnapshot, longSnapshot, shortSnapshot, totalAssets } = vault
  console.log('longSnapshot', longSnapshot.pre)

  const { data: vaultUserSnapshot } = useVaultUserSnapshot(symbol)
  const metadata = VaultMetadata[chainId][symbol]
  const price = longSnapshot.latestVersion.price
  const longPosition = next(longUserSnapshot.pre, longUserSnapshot.position)
  const shortPosition = next(shortUserSnapshot.pre, shortUserSnapshot.position)
  const totalPosition = add(longPosition, shortPosition)
  const leverage = calcLeverage(price as bigint, totalPosition.maker, totalAssets)

  const longExposure = calcExposure(longPosition.maker, next(longSnapshot.pre, longSnapshot.position))
  const shortExposure = calcExposure(shortPosition.maker, next(shortSnapshot.pre, shortSnapshot.position))

  const delta = Big18Math.isZero(totalPosition.maker)
    ? 0n
    : Big18Math.div(Big18Math.sub(longExposure, shortExposure), Big18Math.mul(totalPosition.maker, -1n))

  const exposure = Math.abs(Big18Math.fixedFrom(Big18Math.mul(leverage, delta)).toUnsafeFloat())
  console.log('exposure', exposure)
  const alpha5 = useColorModeValue(colors.brand.blackAlpha[5], colors.brand.whiteAlpha[5])
  // const alpha40 = useColorModeValue(colors.brand.blackAlpha[40], colors.brand.whiteAlpha[40])
  // const alpha50 = useColorModeValue(colors.brand.blackAlpha[50], colors.brand.whiteAlpha[50])
  // const alpha70 = useColorModeValue(colors.brand.blackAlpha[70], colors.brand.whiteAlpha[70])
  // const alpha80 = useColorModeValue(colors.brand.blackAlpha[80], colors.brand.whiteAlpha[80])

  console.log('userSnapshot', vaultUserSnapshot)

  return (
    <Flex height="100%" width="100%" pt={10} px={14} bg={alpha5}>
      <Flex flexDirection="column" mr={9} width="50%" border="1px solid red">
        <VaultDetailTitle
          name={metadata?.name ?? name}
          description="Some description of the vault can go here to let people know why they should deposit"
        />
        {metadata && <SupportedAssetsSection supportedAssets={metadata.assets} />}
        <RiskCard />
      </Flex>
      <Flex flexDirection="column" width="50%" border="1px solid red"></Flex>
    </Flex>
  )
}
