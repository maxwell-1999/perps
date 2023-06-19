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
import { useIntl } from 'react-intl'

import { FeeApr, VaultMetadata, VaultSnapshot } from '@/constants/vaults'
import { useVaultContext } from '@/contexts/vaultContext'
import { useChainId } from '@/hooks/network'
import { formatBig18 } from '@/utils/big18Utils'

import { Button } from '@ds/Button'
import colors from '@ds/theme/colors'

import { useVaultSelectCopy } from '../hooks'

export default function MobileVaultSelect() {
  const { vaultSnapshots, status, setSelectedVault, selectedVault } = useVaultContext()
  const { isOpen, onOpen, onClose } = useDisclosure({ id: 'vaultSelector' })
  const copy = useVaultSelectCopy()

  return (
    <Flex mb="22px" width="100%">
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
            label={selectedVault ? <SelectButtonLabel snapshot={vaultSnapshots[selectedVault]} /> : copy.selectVault}
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
    </Flex>
  )
}

const SelectButtonLabel = ({ snapshot }: { snapshot: VaultSnapshot }) => {
  const intl = useIntl()
  const copy = useVaultSelectCopy()
  const chainId = useChainId()
  const metadata = VaultMetadata[chainId][snapshot.symbol]

  const feeRate = FeeApr[chainId][snapshot.symbol] ?? 0n
  const apy = formatBig18(feeRate * 100n, { numSigFigs: 4, minDecimals: 2 })

  const apyPercent = intl.formatMessage({ defaultMessage: '{apy}%' }, { apy })
  const textColor = useColorModeValue(colors.brand.blackAlpha[50], colors.brand.whiteAlpha[50])

  return (
    <Flex justifyContent="space-between" flex="100%">
      <Text>{metadata ? metadata.name : snapshot.name}</Text>
      <Flex pl={2}>
        <Text mr={2} color={textColor}>
          {copy.apy}
        </Text>
        <Text color={colors.brand.green}>{apyPercent}</Text>
      </Flex>
    </Flex>
  )
}
