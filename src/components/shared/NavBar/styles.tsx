import { Flex, Text } from '@chakra-ui/react'
import styled from '@emotion/styled'

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
