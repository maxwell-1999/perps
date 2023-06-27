import { Flex, Text, useColorModeValue } from '@chakra-ui/react'

import colors from '@ds/theme/colors'

interface ToastProps {
  title: string | React.ReactNode
  titleColor?: string
  body: string | React.ReactNode
  footer?: string | React.ReactNode
}

export default function Toast({ title, titleColor, body, footer }: ToastProps) {
  const bg = useColorModeValue(colors.brand.gray[200], colors.brand.gray[200])
  return (
    <Flex flexDirection="column" bg={bg}>
      <Flex p={2}>{typeof title === 'string' ? <Text color={titleColor}>{title}</Text> : title}</Flex>
    </Flex>
  )
}
