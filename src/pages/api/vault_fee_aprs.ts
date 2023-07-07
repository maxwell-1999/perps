import { kv } from '@vercel/kv'
import { NextApiRequest, NextApiResponse } from 'next'
import { arbitrum } from 'wagmi/chains'

import { SupportedChainId } from '@/constants/network'
import { Hour } from '@/utils/timeUtils'

const SupportedChains: SupportedChainId[] = [arbitrum.id]

export default async function handler(request: NextApiRequest, response: NextApiResponse) {
  const chainId = Number(request.query.chainId)
  if (!SupportedChains.includes(chainId as SupportedChainId)) return response.status(404).end()

  const [alpha, bravo] = await Promise.all([
    kv.get<number>(`${chainId}/vaults/alpha/apr`),
    kv.get<number>(`${chainId}/vaults/bravo/apr`),
  ])

  return response
    .status(200)
    .setHeader('Cache-Control', `s-maxage=${Number(Hour)}, stale-while-revalidate`)
    .json({
      alpha: alpha ?? undefined,
      bravo: bravo ?? undefined,
    })
}
