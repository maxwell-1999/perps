import { Flex } from '@chakra-ui/react'

export const ColumnPageContainer = ({ children }: { children: React.ReactNode }) => (
  <Flex
    flexDirection="column"
    width="100%"
    height="100%"
    alignItems="center"
    py={{ base: 8, lg: 12 }}
    px={{ base: 6, lg: 20 }}
    gap={8}
  >
    {children}
  </Flex>
)
