import { AssetMetadata, SupportedMakerMarket } from '@/constants/assets'
import { getMakerAssetAndDirection } from '@/utils/makerMarketUtils'

export const getAssetDataForMakerMarket = (makerMarket: SupportedMakerMarket) => {
  const { asset } = getMakerAssetAndDirection(makerMarket)
  return AssetMetadata[asset]
}
