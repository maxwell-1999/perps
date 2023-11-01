import { useMemo } from 'react'
import { Chain, useNetwork } from 'wagmi'

import { chains } from '@/constants/network'

export const useActiveChain = () => {
  const { chain } = useNetwork()
  //   const params = useParams();
  const chainName = ''

  const [activeChain, isWrongChain] = useMemo(() => {
    let activeChain
    let isWrongChain = false
    if (chainName !== undefined) {
      activeChain = chains.find((chain) => chain.name.toUpperCase().includes(chainName.toUpperCase()))
    }
    if (activeChain === undefined) {
      activeChain = chain
      if (!chains.filter((c) => c.name == chain?.name)?.length) {
        activeChain = chains[0]
        isWrongChain = true
      }
    }
    return [activeChain, isWrongChain]
  }, [chain, chainName])

  return {
    activeChain,
    isWrongChain,

    chainInURL: chainName,
  }
}
