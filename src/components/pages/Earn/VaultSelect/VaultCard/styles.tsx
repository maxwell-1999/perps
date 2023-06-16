import { Flex } from '@chakra-ui/react'
import { keyframes } from '@chakra-ui/react'
import styled from '@emotion/styled'

export const TitleRow = styled(Flex)`
  height: 76px;
  flex: 1;
  align-items: center;
  padding: 0 18px;
`

export const DescriptionRow = styled(Flex)`
  min-height: 78px;
  flex: 1;
  align-items: center;
  padding: 12px 18px;
`

export const CapacityRow = styled(Flex)`
  flex-direction: column;
  flex: 1;
  align-items: center;
  padding: 0 18px;
  padding-top: 20px;
  padding-bottom: 8px;
`

export const fadeIn = keyframes`
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
`
