import { mainnet, arbitrum, arbitrumGoerli, goerli, baseGoerli } from "wagmi/chains";
import { Address } from "viem";

import { SupportedChainId } from "@/constants/network";

import { LensAbi__factory } from "@t/generated";
import { useChainId, useProvider } from "@/hooks/network";

type AddressMapping = { [chain in SupportedChainId]: Address };

export const useLens = () => {
  const addresses: AddressMapping = {
    [mainnet.id]: "0x26F70E5fA46aD10DF9d43ba469cfAbC79B073a01",
    [arbitrum.id]: "0x1593318424df66128cb7d0c5574B1283C3A74C3d",
    [arbitrumGoerli.id]: "0x19890Cf5C9A0B8d2F71eB71347d126b6F7d78B76",
    [goerli.id]: "0xda17b128BFd23112E946FB4e7BA162029D7d1CdE",
    [baseGoerli.id]: "0x2b99224DAD73d7D84b7C74E9161BbD0D01a2A15b",
  };

  const provider = useProvider();
  const chainId = useChainId();

  return LensAbi__factory.connect(addresses[chainId], provider);
};
