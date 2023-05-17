import { Flex, FlexProps } from "@chakra-ui/react";
import { DataRow } from "@/components/design-system";
import { useIntl } from "react-intl";
import { getReceiptCopy } from "../copy";
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
  const intl = useIntl();
  const copy = getReceiptCopy(intl);
  const { entryPrice, exitPrice, priceImpact, liquidationPrice, tradingFee } = receiptData;
  return (
    <Flex flexDirection="column" {...props}>
      <DataRow label={copy.entryExit} value={`${entryPrice} / ${exitPrice}`} />
      <DataRow label={copy.priceImpact} value={priceImpact} />
      <DataRow label={copy.liquidationPrice} value={liquidationPrice} />
      <DataRow label={copy.tradingFee} value={tradingFee} />
    </Flex>
  );
}

export default Receipt;
