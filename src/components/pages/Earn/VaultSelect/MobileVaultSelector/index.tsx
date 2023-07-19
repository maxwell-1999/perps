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

import { VaultMetadata } from '@/constants/vaults'
import { useVaultContext } from '@/contexts/vaultContext'
import { useChainId } from '@/hooks/network'
import { VaultSnapshot } from '@/hooks/vaults'
import { formatBig18 } from '@/utils/big18Utils'

import { Button } from '@ds/Button'
import colors from '@ds/theme/colors'
import { breakpoints } from '@ds/theme/styles'

import { useVaultSelectCopy } from '../hooks'

const SelectContainer = styled(Flex)`
  width: 100%;
  margin-bottom: 22px;
  display: flex;

  @media (min-width: ${breakpoints.md}) {
    display: none;
  }
`

export default function MobileVaultSelect() {
  const { vaultSnapshots, status, setSelectedVault, selectedVault, feeAPRs } = useVaultContext()
  const { isOpen, onOpen, onClose } = useDisclosure({ id: 'vaultSelector' })
  const copy = useVaultSelectCopy()

  const hasSelection = selectedVault && vaultSnapshots[selectedVault]

  return (
    <SelectContainer>
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
            height="50px"
            label={
              hasSelection ? (
                <SelectButtonLabel
                  snapshot={vaultSnapshots[selectedVault]}
                  feeAPR={feeAPRs?.[vaultSnapshots[selectedVault].vaultType]}
                />
              ) : (
                copy.selectVault
              )
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
              vaultSnapshots.map((snapshot, i) => {
                return (
                  <Button
                    isDisabled={selectedVault === `${i}`}
                    onClick={() => {
                      setSelectedVault(`${i}`)
                      onClose()
                    }}
                    variant="pairDropdown"
                    key={snapshot.address}
                    label={<SelectButtonLabel snapshot={snapshot} />}
                  />
                )
              })
            )}
          </PopoverBody>
        </PopoverContent>
      </Popover>
    </SelectContainer>
  )
}

const SelectButtonLabel = ({ snapshot, feeAPR }: { snapshot: VaultSnapshot; feeAPR?: bigint }) => {
  const intl = useIntl()
  const copy = useVaultSelectCopy()
  const chainId = useChainId()
  const metadata = VaultMetadata[chainId]?.[snapshot.vaultType]

  const feeRate = feeAPR ?? 0n
  const apr = formatBig18(feeRate * 100n, { numSigFigs: 4, minDecimals: 2 })

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
