import { Flex, Text } from '@chakra-ui/react'
import styled from '@emotion/styled'

import { breakpoints } from '@/components/design-system/theme/styles'
import { FormattedBig6Percent } from '@/components/shared/components'

export const DashedLine = styled.span<{ color: string }>`
  height: 20px;
  width: 16px;
  background: ${({ color }) => `repeating-linear-gradient(90deg, ${color} 0 5px, #000000 0 7px) center`};
  background-size: 100% 1px;
  background-repeat: no-repeat;
`

export const MarketInfoContent = styled(Flex)`
  flex-direction: column;
  width: 100%;
  padding: 0 16px;
  max-height: 350px;

  @media (min-width: ${breakpoints.tableBreak}) {
    flex-direction: row;
    flex: 1;
    padding: 16px;
    gap: 3%;
    width: 100%;
  }

  @media (min-width: ${breakpoints.xl}) {
    max-width: 70%;
    gap: 4%;
  }
`
export const PercentRange = ({ max }: { max: bigint }) => (
  <Flex>
    {/* eslint-disable-next-line formatjs/no-literal-string-in-jsx */}
    <Text mr={1}>0% -</Text>
    <FormattedBig6Percent value={max} />
  </Flex>
)
