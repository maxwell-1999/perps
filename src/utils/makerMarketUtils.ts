import { SupportedAsset, SupportedMakerMarket } from '@/constants/assets'
import { OrderDirection } from '@/constants/markets'

export const getMakerAssetAndDirection = (makerMarket: SupportedMakerMarket) => {
  const [asset, direction] = makerMarket.split('-')
  return { asset: asset as SupportedAsset, orderDirection: direction as OrderDirection }
}
