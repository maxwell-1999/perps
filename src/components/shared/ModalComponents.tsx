import { Box, Flex, Spinner, Text, useColorModeValue } from '@chakra-ui/react'
import CheckMark from '@public/icons/checkmark.svg'

import colors from '../design-system/theme/colors'

const StepIncomplete = () => (
  <Box height="16px" width="16px" borderRadius="full" border={`3px solid ${colors.brand.gray[100]}`} />
)

interface ModalStepProps {
  title: string
  description: string | React.ReactNode
  isLoading?: boolean
  isCompleted?: boolean
}

export const ModalStep: React.FC<ModalStepProps> = ({ title, description, isLoading, isCompleted }) => {
  const bg = useColorModeValue(colors.brand.blackAlpha[10], colors.brand.whiteAlpha[10])

  return (
    <Flex mb="22px">
      <Flex
        width="40px"
        height="40px"
        bg={bg}
        borderRadius="full"
        mr="12px"
        alignItems="center"
        justifyContent="center"
      >
        {isCompleted ? (
          <Flex height="20px" width="20px">
            <CheckMark />
          </Flex>
        ) : isLoading ? (
          <Spinner
            size="sm"
            thickness="3px"
            speed="0.65s"
            emptyColor={colors.brand.darkGreen}
            color={colors.brand.green}
          />
        ) : (
          <StepIncomplete />
        )}
      </Flex>
      <Flex flexDirection="column" flex={1}>
        <Text fontSize="15px" mb="3px">
          {title}
        </Text>
        <Text variant="label">{description}</Text>
      </Flex>
    </Flex>
  )
}

export const ModalDetailContainer = ({ children }: { children: React.ReactNode }) => {
  const bg = useColorModeValue(colors.brand.whiteAlpha[20], colors.brand.blackAlpha[20])
  const borderColor = useColorModeValue(colors.brand.blackAlpha[10], colors.brand.whiteAlpha[10])
  return (
    <Flex
      flexDirection="column"
      mb={4}
      bg={bg}
      borderRadius="8px"
      border={`1px solid ${borderColor}`}
      py="12px"
      px="14px"
      width="100%"
      gap={2}
    >
      {children}
    </Flex>
  )
}

interface ModalDetailProps {
  title: string
  action: string
  detail: string | React.ReactNode
  color: string
}

export const ModalDetail: React.FC<ModalDetailProps> = ({ title, action, detail, color }) => {
  return (
    <ModalDetailContainer>
      <Text variant="label" fontSize="12px" mb="5px">
        {title}
      </Text>
      <Text fontSize="15px">
        <Text as="span" color={color} mr={1}>
          {action}
        </Text>
        {detail}
      </Text>
    </ModalDetailContainer>
  )
}
