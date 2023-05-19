import { Flex, Text, FormLabel, Divider, ButtonGroup } from "@chakra-ui/react";
import { useTradeFormState, FormState } from "@/contexts/tradeFormContext";
import { Button } from "@ds/Button";
import { Input, Pill } from "@ds/Input";
import { formIds, buttonPercentValues } from "../constants";
import { useTradeFormCopy, useStyles } from "../hooks";
import { TradeReceipt } from "./Receipt";
import { AssetMetadata, L2SupportedAsset } from "@/constants/currencies";
import { Form, FormOverlayHeader } from "./styles";

interface ClosePositionFormProps {
  positionSize: string; // placeholder for now
  assetMetadata: AssetMetadata[L2SupportedAsset];
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}

function ClosePositionForm(props: ClosePositionFormProps) {
  const { positionSize, assetMetadata, onSubmit } = props;
  const { setTradeFormState } = useTradeFormState();
  const copy = useTradeFormCopy();
  const { percentBtnBg } = useStyles();

  return (
    <Form onSubmit={onSubmit}>
      <FormOverlayHeader
        title={copy.closePosition}
        onClose={() => setTradeFormState(FormState.trade)}
      />
      <Flex flexDirection="column" p="16px">
        <Input
          type="number"
          id={formIds.closeAmount}
          name={formIds.closeAmount}
          labelText={copy.amountToClose}
          placeholder="0.0000"
          rightLabel={
            <FormLabel mr={0} mb={0}>
              <Text variant="label">
                {positionSize} {copy.max}
              </Text>
            </FormLabel>
          }
          rightEl={<Pill text={assetMetadata.quoteCurrency} />}
          mb="12px"
        />
        <Flex mb="12px">
          {buttonPercentValues.map((value, index) => (
            <Button
              variant="transparent"
              fontSize="12px"
              bg={percentBtnBg}
              key={value}
              // eslint-disable-next-line formatjs/no-literal-string-in-jsx
              label={`${value}%`}
              mr={index === buttonPercentValues.length - 1 ? "0" : "8px"}
              onClick={() => {
                // apply percentage value here.
              }}
            />
          ))}
        </Flex>
        <Input
          type="number"
          id={formIds.receiveInput}
          name={formIds.receiveInput}
          labelText={copy.youWillReceive}
          placeholder="0.0000"
          rightLabel={
            <FormLabel mr={0} mb={0}>
              <Text variant="label">
                {positionSize} {copy.max}
              </Text>
            </FormLabel>
          }
          rightEl={<Pill text={assetMetadata.baseCurrency} />}
          mb="12px"
        />
      </Flex>
      <Divider />
      <Flex flexDirection="column" p="16px">
        <TradeReceipt mb="25px" px="3px" hideEntry />
        <ButtonGroup>
          <Button
            label={copy.cancel}
            variant="transparent"
            onClick={() => setTradeFormState(FormState.trade)}
          />
          <Button flex={1} label={copy.closePosition} type="submit" />
        </ButtonGroup>
      </Flex>
    </Form>
  );
}

export default ClosePositionForm;
