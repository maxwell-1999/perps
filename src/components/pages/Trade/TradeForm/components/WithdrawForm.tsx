import { Flex, Text, FormLabel, ButtonGroup } from "@chakra-ui/react";
import { useTradeFormState, FormState } from "@/contexts/tradeFormContext";
import { Button } from "@ds/Button";
import { Input, Pill } from "@ds/Input";
import { formIds } from "../constants";
import { useTradeFormCopy } from "../hooks";
import { Form, FormOverlayHeader } from "./styles";
import { DataRow } from "@/components/design-system";
import { useMarketContext } from "@/contexts/marketContext";

interface WithDrawFormProps {
  collateral: string; // placeholder for now
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}

function WithdrawForm(props: WithDrawFormProps) {
  const { collateral, onSubmit } = props;
  const { setTradeFormState } = useTradeFormState();
  const copy = useTradeFormCopy();
  const { assetMetadata } = useMarketContext();

  return (
    <Form onSubmit={onSubmit}>
      <FormOverlayHeader
        title={copy.withdrawCollateral}
        onClose={() => setTradeFormState(FormState.trade)}
      />
      <Flex flexDirection="column" px="16px">
        <Flex>
          <Text variant="label" fontSize="13px">
            {copy.withdrawBodyText}
          </Text>
        </Flex>
        <Input
          type="number"
          id={formIds.withdrawAmount}
          name={formIds.withdrawAmount}
          labelText={copy.youCanNowWithdraw}
          placeholder="0.0000"
          rightLabel={
            <FormLabel mr={0} mb={0}>
              <Text variant="label">
                {collateral} {copy.max}
              </Text>
            </FormLabel>
          }
          rightEl={<Pill text={assetMetadata.quoteCurrency} />}
          mb="12px"
        />
      </Flex>
      <Flex flexDirection="column" p="16px">
        <DataRow label={copy.youWillGet} value="0.000 USDC" />
        <ButtonGroup mb="15px">
          <Button
            label={copy.cancel}
            variant="transparent"
            onClick={() => setTradeFormState(FormState.trade)}
          />
          <Button flex={1} label={copy.withdrawFunds} type="submit" />
        </ButtonGroup>
        <Flex px="13px" textAlign="center">
          <Text variant="label">{copy.withdrawConfirmText}</Text>
        </Flex>
      </Flex>
    </Form>
  );
}

export default WithdrawForm;
