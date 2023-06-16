import { Box, Heading } from '@chakra-ui/react'
import styled from '@emotion/styled'
import dynamic from 'next/dynamic'

const NavBar = dynamic(() => import('@/components/shared/NavBar'), {
  ssr: false,
})

interface LayoutProps {
  header: React.ReactNode
  subheader: React.ReactNode
  children: React.ReactNode
}

export const TextPageLayout: React.FC<LayoutProps> = ({ header, subheader, children }) => {
  return (
    <Box padding="1.2rem">
      <NavBar />
      <Content margin="0 auto" width="50%" fontSize="md">
        <Heading as="h1" size="2xl" marginY={10}>
          {header}
        </Heading>
        <Heading as="h2" size="lg" mb={8}>
          {subheader}
        </Heading>
        {children}
      </Content>
    </Box>
  )
}

const Content = styled(Box)`
  p {
    margin-bottom: 1rem;
  }

  ul {
    padding-left: 1.5rem;
  }
`
