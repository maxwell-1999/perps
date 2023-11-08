import { useColorModeValue } from '@chakra-ui/color-mode'
import {
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  DrawerProps,
} from '@chakra-ui/react'

export interface MobileDrawerProps extends DrawerProps {
  header?: React.ReactNode
  footer?: React.ReactNode
}

export const MobileDrawer: React.FC<MobileDrawerProps> = ({ footer, header, children, ...props }) => {
  const bg = useColorModeValue('white', 'black')
  return (
    <Drawer {...props}>
      <DrawerOverlay />
      <DrawerContent bg={'#1c1c28'}>
        <DrawerCloseButton />
        <DrawerHeader>{header}</DrawerHeader>
        <DrawerBody>{children}</DrawerBody>
        <DrawerFooter>{footer}</DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
