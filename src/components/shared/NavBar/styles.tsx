import styled from "@emotion/styled";
import { Flex, Text } from "@chakra-ui/react";

export const Nav = styled.nav`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

export const MobileButtonLabel: React.FC<{ label: string }> = ({ label }) => (
  <Flex flex={1}>
    <Text>{label}</Text>
  </Flex>
);
