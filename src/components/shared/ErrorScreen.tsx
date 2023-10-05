import { Flex, FlexProps, Text } from '@chakra-ui/react'
import { useIntl } from 'react-intl'

import colors from '../design-system/theme/colors'

export const ErrorScreen = ({
  message,
  children,
  ...props
}: { message?: string; children?: React.ReactNode } & FlexProps) => {
  const intl = useIntl()
  return (
    <Flex
      minHeight="100%"
      width="100%"
      justifyContent="center"
      alignItems="center"
      flexDirection="column"
      textAlign="center"
      {...props}
    >
      <Text variant="label" fontSize="24px" mb={3} color="white">
        {intl.formatMessage({ defaultMessage: 'Something went wrong' })}
      </Text>
      <Text variant="label" fontSize="16px" color={colors.brand.whiteAlpha[50]} mb={3}>
        {message ? message : intl.formatMessage({ defaultMessage: 'Please refresh the page and try again' })}
      </Text>
      {children}
    </Flex>
  )
}
