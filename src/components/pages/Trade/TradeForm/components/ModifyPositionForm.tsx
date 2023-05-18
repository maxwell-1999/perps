import { Flex, Text, FormLabel, Divider, ButtonGroup } from "@chakra-ui/react";
import { useTradeFormState, FormState } from "@/contexts/tradeFormContext";
import { Button, IconButton } from "@ds/Button";
import { Input, Pill } from "@ds/Input";
import { Slider } from "@ds/Slider";
import Toggle from "@/components/shared/Toggle";
import { orderSides, OrderSide, formIds } from "../constants";
import { useTradeFormCopy } from "../hooks";
import Receipt from "./Receipt";
import CloseX from "@public/icons/close-x.svg";
import { AssetMetadata, L2SupportedAsset } from "@/constants/currencies";

interface ModifyPositionProps {
  orderSide: OrderSide;
  setOrderSide: (orderSide: OrderSide) => void;
  assetMetadata: AssetMetadata[L2SupportedAsset];
  availableCollateral: string; //bignumberish
  amount: string; //bignumberish
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}

function ModifyPositionForm(props: ModifyPositionProps) {
  const { orderSide, setOrderSide, availableCollateral, amount, assetMetadata, onSubmit } = props;
  const { setTradeFormState } = useTradeFormState();
  const copy = useTradeFormCopy();

  return (
    <form onSubmit={onSubmit}>
      <Flex flexDirection="column" p="16px">
        <Flex justifyContent="space-between" mb="14px" alignItems="center">
          <Text>{copy.modifyPosition}</Text>
          <IconButton
            variant="text"
            icon={<CloseX />}
            aria-label={copy.close}
            onClick={() => setTradeFormState(FormState.trade)}
          />
        </Flex>
        <Flex mb="14px">
          <Toggle<OrderSide> labels={orderSides} activeLabel={orderSide} onChange={setOrderSide} />
        </Flex>
        <Input
          type="number"
          id={formIds.collateral}
          labelText="Collateral"
          placeholder="0.0000"
          rightLabel={
            <FormLabel mr={0} mb={0}>
              <Text variant="label">
                {availableCollateral} {copy.max}
              </Text>
            </FormLabel>
          }
          rightEl={<Pill text={assetMetadata.baseCurrency} />}
          mb="12px"
        />
        <Input
          type="number"
          id={formIds.amount}
          labelText="Amount"
          placeholder="0.0000"
          rightLabel={
            <FormLabel mr={0} mb={0}>
              <Text variant="label">
                {amount} {copy.max}
              </Text>
            </FormLabel>
          }
          rightEl={<Pill text={assetMetadata.quoteCurrency} />}
          mb="12px"
        />
        {/* Default slider til we get designs */}
        <Slider
          label={copy.leverage}
          ariaLabel="leverage-slider"
          min={0}
          max={20}
          step={0.1}
          onChangeEnd={(value: number) => {
            console.log("leverage", value);
          }}
          containerProps={{
            mb: 2,
          }}
        />
      </Flex>
      <Divider />
      <Flex flexDirection="column" p="16px">
        <Receipt mb="25px" px="3px" />
        <ButtonGroup>
          <Button
            label={copy.cancel}
            variant="transparent"
            onClick={() => setTradeFormState(FormState.trade)}
          />
          <Button flex={1} label={copy.modifyPosition} type="submit" />
        </ButtonGroup>
      </Flex>
    </form>
  );
}

export default ModifyPositionForm;
