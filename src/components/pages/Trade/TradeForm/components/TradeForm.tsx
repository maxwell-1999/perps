import { Flex, Text, FormLabel, Divider } from "@chakra-ui/react";
import { useTradeFormOverlay, TradeFormOverlayStates } from "@/contexts/tradeFormContext";
import { Button } from "@ds/Button";
import { Input, Pill } from "@ds/Input";
import Toggle from "@/components/shared/Toggle";
import { orderSides, OrderSide, formIds } from "../constants";
import { useStyles } from "../hooks";
import Receipt from "./Receipt";

interface TradeFormProps {
  orderSide: OrderSide;
  setOrderSide: (orderSide: OrderSide) => void;
  asset: string; // L2SupportedAsset?
  availableCollateral: string; //bignumberish
  amount: string; //bignumberish
}

function TradeForm(props: TradeFormProps) {
  const { orderSide, setOrderSide, asset, availableCollateral, amount } = props;
  const { textColor, textBtnColor, textBtnHoverColor } = useStyles();
  const { setTradeFormOverlay } = useTradeFormOverlay();

  return (
    <form>
      <Flex flexDirection="column" p="16px">
        <Flex justifyContent="space-between" mb="14px">
          <Text color={textColor}>Trade</Text>
          <Button
            variant="text"
            label="Add collateral"
            p={0}
            lineHeight={1}
            height="initial"
            fontSize="13px"
            color={textBtnColor}
            _hover={{ color: textBtnHoverColor }}
            onClick={() => setTradeFormOverlay(TradeFormOverlayStates.add)}
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
              <Text variant="label">{availableCollateral} Max</Text>
            </FormLabel>
          }
          rightEl={<Pill text={asset} />}
          mb="12px"
        />
        <Input
          type="number"
          id={formIds.amount}
          labelText="Amount"
          placeholder="0.0000"
          rightLabel={
            <FormLabel mr={0} mb={0}>
              <Text variant="label">{amount} Max</Text>
            </FormLabel>
          }
          rightEl={<Pill text={asset} />}
          mb="12px"
        />
      </Flex>
      <Divider />
      <Flex flexDirection="column" p="16px">
        <Receipt mb="25px" px="3px" />
        <Button type="submit" label="Place trade" />
      </Flex>
    </form>
  );
}

export default TradeForm;
