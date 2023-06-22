import { useQuery } from '@tanstack/react-query'
import { parseAbi } from 'viem'
import { mainnet } from 'wagmi'
import { readContract } from 'wagmi/actions'

import { ChainalysisContractAddress, MultiInvokerAddresses } from '@/constants/contracts'
import { SupportedChainId, SupportedChainIds } from '@/constants/network'
import { PerennialVaultType, SupportedVaults, VaultSymbol } from '@/constants/vaults'
import { getVaultForType } from '@/utils/contractUtils'

import { useDSU, useUSDC } from './contracts'
import { useAddress, useChainId, useProvider } from './network'

export type Balances =
  | {
      usdc: bigint
      usdcAllowance: bigint
      dsuAllowance: bigint
      sharesAllowance: {
        PVA?: bigint | undefined
        PVB?: bigint | undefined
        ePBV?: bigint | undefined
      }
    }
  | undefined

export const useBalances = () => {
  const chainId = useChainId() as SupportedChainId
  const provider = useProvider()
  const { address } = useAddress()
  const usdcContract = useUSDC()
  const dsuContract = useDSU()

  return useQuery({
    queryKey: ['balances', chainId, address],
    enabled: !!address,
    queryFn: async () => {
      if (!address || !chainId || !provider || !SupportedChainIds.includes(chainId)) return

      const [usdcBalance, usdcAllowance, dsuAllowance] = await Promise.all([
        usdcContract.balanceOf(address),
        usdcContract.allowance(address, MultiInvokerAddresses[chainId]),
        dsuContract.allowance(address, MultiInvokerAddresses[chainId]),
      ])

      const [alphaVaultAllowance, bravoVaultAllowance] = await Promise.all(
        Object.values(PerennialVaultType).map((vaultType) => {
          const vaultContract = getVaultForType(vaultType, chainId, provider)
          if (!vaultContract) return Promise.resolve(null)
          return vaultContract.allowance(address, MultiInvokerAddresses[chainId])
        }),
      )
      // Map vault allowances to vault symbol
      const sharesAllowance = Object.keys(SupportedVaults[chainId])
        .filter((vaultType) => SupportedVaults[chainId][vaultType as PerennialVaultType])
        .reduce<{ [key in VaultSymbol]?: bigint }>((acc, vaultType) => {
          return {
            ...acc,
            [SupportedVaults[chainId][vaultType as PerennialVaultType] as string]:
              vaultType === PerennialVaultType.alpha ? alphaVaultAllowance : bravoVaultAllowance,
          }
        }, {})

      return {
        usdc: usdcBalance,
        usdcAllowance,
        dsuAllowance,
        sharesAllowance,
      }
    },
  })
}

export const useIsSanctioned = () => {
  const { address } = useAddress()

  return useQuery({
    queryKey: ['chainalysis_sanctioned', address],
    enabled: !!address,
    queryFn: async () => {
      if (!address) return

      return readContract({
        address: ChainalysisContractAddress,
        abi: parseAbi(['function isSanctioned(address) view returns (bool)']),
        functionName: 'isSanctioned',
        args: [address],
        chainId: mainnet.id,
      })
    },
  })
}
