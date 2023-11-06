import { CloseIcon } from '@chakra-ui/icons'
import { Flex, Text, useColorModeValue } from '@chakra-ui/react'

import colors from '@ds/theme/colors'

interface ToastProps {
  title: string
  body: string | React.ReactNode
  onClose: () => void
  error?: boolean
  titleColor?: string
}

export default function Toast({ title, body, onClose, error, titleColor }: ToastProps) {
  const bg = useColorModeValue(colors.brand.gray[200], colors.brand.gray[200])
  const iconColor = useColorModeValue(colors.brand.blackAlpha[50], colors.brand.whiteAlpha[50])
  const iconHoverColor = useColorModeValue(colors.brand.blackAlpha[70], colors.brand.whiteAlpha[70])
  const defaultTitleColor = useColorModeValue(colors.brand.blackAlpha[70], colors.brand.whiteAlpha[70])

  return (
    <Flex
      flexDirection="column"
      bg={'#232334'}
      borderRadius="12px"
      p={3}
      border={error ? `1px solid ${colors.brand.red}` : 'none'}
      maxWidth="300px"
    >
      <Flex justifyContent="space-between" alignItems="center" flex={1}>
        <Text variant="label" fontSize="12px" color={titleColor ? titleColor : defaultTitleColor}>
          {title}
        </Text>
        <CloseIcon
          onClick={onClose}
          cursor="pointer"
          color={iconColor}
          height="10px"
          width="10px"
          _hover={{ color: iconHoverColor }}
        />
      </Flex>
      {typeof body === 'string' ? <Text>{body}</Text> : body}
    </Flex>
  )
}

export const ToastMessage = ({
  action,
  message,
  actionColor,
}: {
  message: string
  action?: string
  actionColor?: string
}) => {
  return (
    <Text>
      {action && (
        <Text as="span" color={actionColor} mr={1}>
          {action}
        </Text>
      )}
      {message}
    </Text>
  )
}
