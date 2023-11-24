import { Box, Flex, Text } from '@chakra-ui/react'
import styled from '@emotion/styled'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'

import { TrackingEvents, useMixpanel } from '@/analytics'
import { Button } from '@/components/design-system'
import colors from '@/components/design-system/theme/colors'
import { AssetMetadata, SupportedAsset } from '@/constants/markets'
import { useUserCurrentPositions } from '@/hooks/markets'

import { useNavCopy } from './hooks'

export const Nav = styled.nav`
  display: flex;
  align-items: center;
  justify-content: space-between;
`

export const MobileButtonLabel: React.FC<{ label: string }> = ({ label }) => (
  <Flex flex={1}>
    <Text>{label}</Text>
  </Flex>
)

export const V1Link = () => {
  const { data: v1PositionSnapshots } = useUserCurrentPositions()
  const [showV1Link, setShowV1Link] = useState(false)
  const copy = useNavCopy()
  const { track } = useMixpanel()

  useEffect(() => {
    if (v1PositionSnapshots && v1PositionSnapshots.length > 0) {
      const hasOpenPosition = v1PositionSnapshots.some((snapshot) => snapshot.collateral > 0n)
      setShowV1Link(hasOpenPosition)
    }
  }, [v1PositionSnapshots])

  if (!showV1Link) {
    return null
  }

  return (
    <Link href="https://v1.perennial.finance">
      <Button
        onClick={() => {
          track(TrackingEvents.goToV1, {})
        }}
        variant="secondary"
        bg={colors.brand.whiteAlpha[20]}
        borderColor={colors.brand.purple[240]}
        label={<Text>{copy.closeV1Positions}</Text>}
      />
    </Link>
  )
}
export const RewardsLink = () => {
  const copy = useNavCopy()
  const arbMetadata = AssetMetadata[SupportedAsset.arb]

  return (
    <Box display={{ base: 'none', lg: 'initial' }}>
      <Link href="/rewards">
        <Button
          className="!py-[5px] !h-fit !px-3"
          variant="secondary"
          bg={colors.brand.blueAlpha[16]}
          borderColor={colors.brand.blueAlpha[100]}
          _hover={{
            bg: colors.brand.blueAlpha[30],
          }}
          leftIcon={
            <Image
              className="!w-[18px] !h-[18px]"
              src={arbMetadata.icon}
              alt={'arbitrum logo'}
              height={18}
              width={18}
            />
          }
          label={
            <Text>
              Earning
              <Text ml={1} as="span" fontWeight="bold">
                {arbMetadata.baseCurrency.toUpperCase()}
              </Text>
            </Text>
          }
        />
      </Link>
    </Box>
  )
}
