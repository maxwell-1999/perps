import { HamburgerIcon } from '@chakra-ui/icons'
import {
  Flex,
  Popover,
  PopoverBody,
  PopoverContent,
  PopoverTrigger,
  Spinner,
  Text,
  useColorModeValue,
  useDisclosure,
} from '@chakra-ui/react'
import styled from '@emotion/styled'
import { useIntl } from 'react-intl'

import { PerennialVaultType, VaultMetadata } from '@/constants/vaults'
import { useVaultContext } from '@/contexts/vaultContext'
import { useChainId } from '@/hooks/network'
import { VaultSnapshot2 } from '@/hooks/vaults2'
import { formatBig6 } from '@/utils/big6Utils'

import { Button } from '@ds/Button'
import colors from '@ds/theme/colors'
import { breakpoints } from '@ds/theme/styles'

import { useVaultSelectCopy } from '../hooks'

export const MobileSelectContainer = styled(Flex)`
  width: 100%;
  margin-bottom: 22px;
  display: flex;

  @media (min-width: ${breakpoints.md}) {
    display: none;
  }
`

export default function VaultDropdown({
  isDisabled,
  height,
  onClick,
}: {
  isDisabled?: boolean
  height?: string
  onClick?: (vault: PerennialVaultType) => void
}) {
  const { vaultSnapshots, status, setSelectedVault, selectedVault } = useVaultContext()

  const { isOpen, onOpen, onClose } = useDisclosure({ id: 'vaultSelector' })
  const copy = useVaultSelectCopy()

  const hasSelection = selectedVault && vaultSnapshots?.vault[selectedVault]
  const selectedSnapshot = hasSelection ? vaultSnapshots?.vault[selectedVault] : undefined

  return (
    <Popover
      placement="bottom-start"
      variant="assetSelector"
      isOpen={isOpen}
      onOpen={onOpen}
      onClose={onClose}
      isLazy
      matchWidth
    >
      <PopoverTrigger>
        <Button
          width="100%"
          height={height ? height : '50px'}
          label={
            hasSelection && selectedSnapshot ? <SelectButtonLabel snapshot={selectedSnapshot} /> : copy.selectVault
          }
          variant="pairSelector"
          rightIcon={<HamburgerIcon height="20px" width="20px" />}
        />
      </PopoverTrigger>
      <PopoverContent width="100%">
        <PopoverBody>
          {status !== 'success' ? (
            <Flex width="100%" height="100%" justifyContent="center" alignItems="center">
              <Spinner />
            </Flex>
          ) : (
            Object.values(vaultSnapshots?.vault ?? {}).map((snapshot) => {
              return (
                <Button
                  isDisabled={selectedVault === snapshot.vaultType || isDisabled}
                  onClick={
                    onClick
                      ? () => onClick(snapshot.vaultType)
                      : () => {
                          setSelectedVault(snapshot.vaultType)
                          onClose()
                        }
                  }
                  variant="pairDropdown"
                  key={snapshot.vault}
                  label={<SelectButtonLabel snapshot={snapshot} />}
                />
              )
            })
          )}
        </PopoverBody>
      </PopoverContent>
    </Popover>
  )
}

const SelectButtonLabel = ({ snapshot, feeAPR }: { snapshot: VaultSnapshot2; feeAPR?: bigint }) => {
  const intl = useIntl()
  const copy = useVaultSelectCopy()
  const chainId = useChainId()
  const metadata = VaultMetadata[chainId]?.[snapshot.vaultType]

  const feeRate = feeAPR ?? 0n
  const apr = formatBig6(feeRate * 100n, { numSigFigs: 4, minDecimals: 2 })

  const aprPercent = intl.formatMessage({ defaultMessage: '{apr}%' }, { apr })
  const textColor = useColorModeValue(colors.brand.blackAlpha[50], colors.brand.whiteAlpha[50])

  return (
    <Flex justifyContent="space-between" flex="100%">
      <Text>{metadata ? metadata.name : snapshot.name}</Text>
      <Flex pl={2}>
        <Text mr={2} color={textColor}>
          {copy.apr}
        </Text>
        <Text color={colors.brand.green}>{aprPercent}</Text>
      </Flex>
    </Flex>
  )
}
