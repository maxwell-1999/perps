import { useQuery, useQueryClient } from '@tanstack/react-query'
import { parseAbi, zeroAddress } from 'viem'
import { arbitrum } from 'viem/chains'
import { useNetwork, useWalletClient } from 'wagmi'
import { readContract, waitForTransaction } from 'wagmi/actions'

import { ChainalysisContractAddress, MultiInvoker2Addresses } from '@/constants/contracts'

import { useDSU, useMarketFactory, useUSDC } from './contracts'
import { useAddress, useChainId } from './network'

export type Balances =
  | {
      usdc: bigint
      usdcAllowance: bigint
      dsuAllowance: bigint
    }
  | undefined

export const useBalances = () => {
  const chainId = useChainId()
  const { address } = useAddress()
  const usdcContract = useUSDC()
  const dsuContract = useDSU()

  return useQuery({
    queryKey: ['balances', chainId, address],
    enabled: !!address,
    queryFn: async () => {
      if (!address || !chainId) return

      const [usdcBalance, usdcAllowance, dsuAllowance] = await Promise.all([
        usdcContract.read.balanceOf([address]),
        usdcContract.read.allowance([address, MultiInvoker2Addresses[chainId]]),
        dsuContract.read.allowance([address, MultiInvoker2Addresses[chainId]]),
      ])

      return {
        usdc: usdcBalance,
        usdcAllowance,
        dsuAllowance,
      }
    },
  })
}

export const useOperators = () => {
  const chainId = useChainId()
  const marketFactory = useMarketFactory()
  const { address } = useAddress()

  return useQuery({
    queryKey: ['operators', chainId, address],
    enabled: !!address,
    queryFn: async () => {
      if (!address || !chainId) return

      return {
        multiInvokerApproved: await marketFactory.read.operators([address, MultiInvoker2Addresses[chainId]]),
      }
    },
  })
}

export const useOperatorTransactions = () => {
  const { chain } = useNetwork()
  const chainId = useChainId()
  const queryClient = useQueryClient()
  const { data: walletClient } = useWalletClient()
  const marketFactory = useMarketFactory(walletClient ?? undefined)
  const { address } = useAddress()

  const onApproveMultiInvokerOperator = async () => {
    try {
      const hash = await marketFactory.write.updateOperator([MultiInvoker2Addresses[chainId], true], {
        account: address ?? zeroAddress,
        chainId,
        chain,
      })
      const receipt = await waitForTransaction({ hash })
      await queryClient.invalidateQueries({ queryKey: ['operators', chainId, address] })
      return receipt
    } catch (err) {
      // prevent error if user rejects tx
      return
    }
  }

  return {
    onApproveMultiInvokerOperator,
  }
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
        abi: parseAbi(['function isSanctioned(address) view returns (bool)'] as const),
        functionName: 'isSanctioned',
        args: [address],
        chainId: arbitrum.id,
      })
    },
  })
}
