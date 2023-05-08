import {
  Drawer,
  DrawerBody,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  DrawerProps,
} from "@chakra-ui/react";
import { useColorModeValue } from "@chakra-ui/color-mode";

export interface MobileDrawerProps extends DrawerProps {
  header?: React.ReactNode;
  footer?: React.ReactNode;
}

export const MobileDrawer: React.FC<MobileDrawerProps> = ({
  footer,
  header,
  children,
  ...props
}) => {
  const bg = useColorModeValue("white", "black");
  return (
    <Drawer {...props}>
      <DrawerOverlay />
      <DrawerContent bg={bg}>
        <DrawerCloseButton />
        <DrawerHeader>{header}</DrawerHeader>
        <DrawerBody>{children}</DrawerBody>
        <DrawerFooter>{footer}</DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};
