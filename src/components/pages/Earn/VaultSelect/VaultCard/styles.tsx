import { Box, Flex, Spinner, Text, useColorModeValue } from '@chakra-ui/react'
import { keyframes } from '@chakra-ui/react'
import styled from '@emotion/styled'

import { FormattedBig6USDPrice } from '@/components/shared/components'
import { VaultAccountSnapshot2, VaultSnapshot2, useVaultPositionHistory } from '@/hooks/vaults2'
import { Big6Math } from '@/utils/big6Utils'

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
  vaultAccountSnapshot,
  vault,
}: {
  vault: VaultSnapshot2
  vaultAccountSnapshot: VaultAccountSnapshot2
}) => {
  const { data: positionHistory } = useVaultPositionHistory()
  const copy = useVaultSelectCopy()
  const alpha10 = useColorModeValue(colors.brand.blackAlpha[10], colors.brand.whiteAlpha[10])
  const alpha20 = useColorModeValue(colors.brand.blackAlpha[20], colors.brand.whiteAlpha[20])
  const alpha70 = useColorModeValue(colors.brand.blackAlpha[70], colors.brand.whiteAlpha[70])
  const pnl = usePnl({ vault, vaultAccountSnapshot, vaultPositionHistory: positionHistory?.[vault.vaultType] })
  const pnlColor = pnl && pnl > 0n ? colors.brand.green : colors.brand.red
  const assets = vaultAccountSnapshot?.assets ?? 0n
  const pendingDeposits = vaultAccountSnapshot?.accountData.deposit ?? 0n
  const pendingRedemption = vaultAccountSnapshot?.accountData.redemption ?? 0n
  const positionAmount = Big6Math.sub(Big6Math.add(assets, pendingDeposits), pendingRedemption)
  const hasPosition = !Big6Math.isZero(positionAmount)
  const positionUpdating = Boolean(
    vaultAccountSnapshot &&
      (!Big6Math.isZero(vaultAccountSnapshot.accountData.deposit) ||
        !Big6Math.isZero(vaultAccountSnapshot.accountData.redemption)),
  )

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
        <Flex px={2} flex={1} justifyContent="space-between" flexWrap="wrap">
          <Text color={alpha70} fontSize="12px">
            {copy.size}
          </Text>
          <FormattedBig6USDPrice value={positionAmount} fontSize="12px" fontWeight={500} />
        </Flex>
        <Box width="1px" height="100%" bg={alpha10} />
        <Flex flex={1} px={2} justifyContent="space-between" flexWrap="wrap">
          <Text color={alpha70} fontSize="12px">
            {copy.pnl}
          </Text>
          {positionUpdating ? (
            <Flex alignItems="center" justifyContent="center">
              <Spinner size="xs" />
            </Flex>
          ) : (
            <FormattedBig6USDPrice value={pnl ?? 0n} fontSize="12px" fontWeight={500} compact color={pnlColor} />
          )}
        </Flex>
      </Container>
    </Flex>
  )
}
