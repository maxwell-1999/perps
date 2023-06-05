import { useQuery } from '@tanstack/react-query'
import { useAccount, useChainId } from 'wagmi'

import { multiInvokerContract } from '@/constants/contracts'
import { SupportedChainId, SupportedChainIds } from '@/constants/network'

import { useUSDC } from './contracts'
import { useProvider } from './network'

export type Balances = {
  dsu: bigint
  dsuFormatted: string
  usdc: bigint
  usdcFormatted: string
}

export const useBalances = () => {
  const chainId = useChainId() as SupportedChainId
  const provider = useProvider()
  const { address } = useAccount()
  const usdcContract = useUSDC()

  return useQuery({
    queryKey: ['balances', chainId, address],
    enabled: !!address,
    queryFn: async () => {
      if (!address || !chainId || !provider || !SupportedChainIds.includes(chainId)) return
      const usdcBalance = await usdcContract.balanceOf(address)
      const usdcAllowance = await usdcContract.allowance(address, multiInvokerContract.address[chainId])

      return {
        usdc: usdcBalance,
        usdcAllowance,
      }
    },
  })
}
