import { Box, Flex, Text, useColorModeValue } from '@chakra-ui/react'
import { keyframes } from '@chakra-ui/react'
import styled from '@emotion/styled'

import { FormattedBig18USDPrice } from '@/components/shared/components'
import { VaultSnapshot, VaultUserSnapshot } from '@/hooks/vaults'
import { Big18Math } from '@/utils/big18Utils'

import { Container } from '@ds/Container'
import colors from '@ds/theme/colors'

import { usePnl } from '../../VaultDetail/hooks'
import { useVaultSelectCopy } from '../hooks'

export const TitleRow = styled(Flex)`
  height: 76px;
  flex: 1;
  align-items: center;
  padding: 0 18px;
`

export const DescriptionRow = styled(Flex)`
  min-height: 78px;
  flex: 1;
  align-items: center;
  padding: 12px 18px;
`

export const CapacityRow = styled(Flex)`
  flex-direction: column;
  flex: 1;
  align-items: center;
  padding: 0 18px;
  padding-top: 20px;
  padding-bottom: 8px;
`

export const fadeIn = keyframes`
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
`

export const VaultUserStats = ({
  vaultUserSnapshot,
  vault,
}: {
  vault: VaultSnapshot
  vaultUserSnapshot: VaultUserSnapshot
}) => {
  const copy = useVaultSelectCopy()
  const alpha10 = useColorModeValue(colors.brand.blackAlpha[10], colors.brand.whiteAlpha[10])
  const alpha20 = useColorModeValue(colors.brand.blackAlpha[20], colors.brand.whiteAlpha[20])
  const alpha70 = useColorModeValue(colors.brand.blackAlpha[70], colors.brand.whiteAlpha[70])
  const pnl = usePnl({ vault, vaultUserSnapshot })
  const pnlColor = pnl && pnl > 0n ? colors.brand.green : colors.brand.red
  const assets = vaultUserSnapshot?.assets ?? 0n
  const pendingDeposits = vaultUserSnapshot?.pendingDepositAmount ?? 0n
  const pendingRedemption = vaultUserSnapshot?.pendingRedemptionAmount ?? 0n
  const positionAmount = Big18Math.sub(Big18Math.add(assets, pendingDeposits), pendingRedemption)
  const hasPosition = !Big18Math.isZero(positionAmount)

  if (!hasPosition) return null

  return (
    <Flex p={2}>
      <Container
        border={`1px solid ${alpha20}`}
        bg={alpha10}
        minHeight="42px"
        flexDirection="row"
        alignItems="center"
        py={1}
        borderRadius="7px"
      >
        <Flex px={2} flex={1} justifyContent="space-between">
          <Text color={alpha70} fontSize="12px">
            {copy.size}
          </Text>
          <FormattedBig18USDPrice value={positionAmount} fontSize="12px" fontWeight={500} compact />
        </Flex>
        <Box width="1px" height="100%" bg={alpha10} />
        <Flex flex={1} px={2} justifyContent="space-between">
          <Text color={alpha70} fontSize="12px">
            {copy.pnl}
          </Text>
          <FormattedBig18USDPrice value={pnl} fontSize="12px" fontWeight={500} compact color={pnlColor} />
        </Flex>
      </Container>
    </Flex>
  )
}
