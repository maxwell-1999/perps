import { useQuery } from '@tanstack/react-query'
import { formatUnits } from 'viem'
import { useAccount, useChainId } from 'wagmi'

import { SupportedChainId, SupportedChainIds } from '@/constants/network'

import { useDSU, useUSDC } from './contracts'
import { useProvider } from './network'

const formatUsdValue = (value: bigint) => {
  return Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    minimumSignificantDigits: 6,
    maximumSignificantDigits: 6,
    // @ts-ignore
    roundingPriority: 'morePrecision',
  }).format(Number(formatUnits(value, 6)))
}

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
  const dsuContract = useDSU()
  const usdcContract = useUSDC()

  return useQuery({
    queryKey: ['balances', chainId, address],
    enabled: !!address,
    queryFn: async () => {
      if (!address || !chainId || !provider || !SupportedChainIds.includes(chainId)) return
      const dsuBalance = await dsuContract.balanceOf(address)
      const usdcBalance = await usdcContract.balanceOf(address)

      return {
        dsu: dsuBalance,
        dsuFormatted: formatUsdValue(dsuBalance),
        usdc: usdcBalance,
        usdcFormatted: formatUsdValue(usdcBalance),
      }
    },
  })
}
