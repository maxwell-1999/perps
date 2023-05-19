import styled from "@emotion/styled";
import { useStyles, useTradeFormCopy } from "../hooks";
import { Flex, IconButton, Text } from "@chakra-ui/react";
import CloseX from "@public/icons/close-x.svg";

export const Form = styled("form")`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
`;

export const FormOverlayHeader = ({ title, onClose }: { title: string; onClose: () => void }) => {
  const copy = useTradeFormCopy();
  const { dashedBorderColor } = useStyles();

  return (
    <Flex
      justifyContent="space-between"
      px="16px"
      py="14px"
      mb="14px"
      alignItems="center"
      borderBottom={`1px dashed ${dashedBorderColor}`}
    >
      <Text fontSize="17px">{title}</Text>
      <IconButton variant="text" icon={<CloseX />} aria-label={copy.close} onClick={onClose} />
    </Flex>
  );
};
