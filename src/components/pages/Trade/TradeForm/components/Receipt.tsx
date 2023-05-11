import { Flex, FlexProps } from "@chakra-ui/react";
import { DataRow } from "@/components/design-system";
// import { BigNumberish } from "ethers";

// export interface ReceiptProps {
//   entryPrice: string;
//   exitPrice: string;
//   priceImpact: string;
//   liquidationPrice: string;
//   tradingFee: string;
// }

const receiptData = {
  entryPrice: "0.000",
  exitPrice: "0.000",
  priceImpact: "0.000",
  liquidationPrice: "0.000",
  tradingFee: "0.000",
};

function Receipt(props: FlexProps) {
  const { entryPrice, exitPrice, priceImpact, liquidationPrice, tradingFee } = receiptData;
  return (
    <Flex flexDirection="column" {...props}>
      <DataRow label="Entry / Exit" value={`${entryPrice} / ${exitPrice}`} />
      <DataRow label="Price Impact" value={priceImpact} />
      <DataRow label="Liquidation Price" value={liquidationPrice} />
      <DataRow label="Trading Fee" value={tradingFee} />
    </Flex>
  );
}

export default Receipt;
