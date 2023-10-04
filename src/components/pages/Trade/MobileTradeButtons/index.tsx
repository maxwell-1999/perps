import { Flex } from '@chakra-ui/react'
import { useIntl } from 'react-intl'

import { useMarketContext } from '@/contexts/marketContext'
import { useTradeFormState } from '@/contexts/tradeFormContext'
import { getPositionFromSelectedMarket } from '@/utils/positionUtils'

import { Button, ButtonGroup } from '@ds/Button'
import colors from '@ds/theme/colors'

export default function MobileTradeButtons({ isMaker }: { isMaker?: boolean }) {
  const { selectedMarket, snapshots2, selectedMakerMarket } = useMarketContext()
  const { setMobileTradeFormOpen } = useTradeFormState()
  const asset = selectedMarket.toUpperCase()
  const intl = useIntl()
  const tradeCopy = intl.formatMessage({ defaultMessage: 'Trade {asset}' }, { asset })
  const makeCopy = intl.formatMessage({ defaultMessage: 'Make {asset}' }, { asset })
  const manage = intl.formatMessage({ defaultMessage: 'Manage {asset} Position' }, { asset })
  const hasPosition = !!getPositionFromSelectedMarket({
    isMaker,
    userMarketSnapshots: snapshots2?.user,
    selectedMarket,
    selectedMakerMarket,
  })

  return (
    <Flex
      width="100%"
      height="100%"
      borderTop={`1px solid ${colors.brand.whiteAlpha[10]}`}
      p={2}
      alignItems="center"
      justifyContent="center"
    >
      <ButtonGroup width="100%">
        <Button
          variant="primary"
          flex={1}
          size="md"
          label={hasPosition ? manage : isMaker ? makeCopy : tradeCopy}
          onClick={() => setMobileTradeFormOpen(true)}
        />
      </ButtonGroup>
    </Flex>
  )
}
