import { useQuery } from '@tanstack/react-query'
import { parseAbi } from 'viem'
import { mainnet } from 'wagmi'
import { readContract } from 'wagmi/actions'

import { ChainalysisContractAddress, MultiInvokerAddresses } from '@/constants/contracts'
import { SupportedChainId, SupportedChainIds } from '@/constants/network'
import { PerennialVaultType } from '@/constants/vaults'

import { getVaultForType, useUSDC } from './contracts'
import { useAddress, useChainId, useProvider } from './network'

export type Balances = {
  dsu: bigint
  dsuFormatted: string
  usdc: bigint
  usdcFormatted: string
}

export const useBalances = () => {
  const chainId = useChainId() as SupportedChainId
  const provider = useProvider()
  const { address } = useAddress()
  const usdcContract = useUSDC()

  return useQuery({
    queryKey: ['balances', chainId, address],
    enabled: !!address,
    queryFn: async () => {
      if (!address || !chainId || !provider || !SupportedChainIds.includes(chainId)) return
      const usdcBalance = await usdcContract.balanceOf(address)
      const usdcAllowance = await usdcContract.allowance(address, MultiInvokerAddresses[chainId])

      return {
        usdc: usdcBalance,
        usdcAllowance,
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

export const useVaultAllowances = (vaultType: PerennialVaultType) => {
  const chainId = useChainId()
  const provider = useProvider()
  const { address } = useAddress()
  const usdcContract = useUSDC()

  return useQuery({
    queryKey: ['vaultAllowances', chainId, vaultType, address],
    enabled: !!chainId && !!address,
    queryFn: async () => {
      if (!address || !chainId) return
      const vaultContract = getVaultForType(vaultType, chainId, provider)

      const [usdc, shares] = await Promise.all([
        usdcContract.allowance(address, MultiInvokerAddresses[chainId]),
        vaultContract.allowance(address, MultiInvokerAddresses[chainId]),
      ])

      return { usdc, shares }
    },
  })
}
