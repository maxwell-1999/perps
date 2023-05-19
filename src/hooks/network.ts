import {
  DefaultChain,
  SupportedChainId,
  isSupportedChain,
  AlchemyActiveKey,
} from "@/constants/network";
import { useNetwork, usePublicClient } from "wagmi";
import { baseGoerli } from "wagmi/chains";
import { AlchemyProvider, JsonRpcProvider } from "ethers";
import { useMemo } from "react";

export const useChainId = () => {
  let { chain } = useNetwork();
  chain = chain ?? DefaultChain;

  if (chain === undefined || !isSupportedChain(chain)) throw new Error("Invalid chain");

  return chain.id as SupportedChainId;
};

export const useProvider = () => {
  const publicClient = usePublicClient();

  return useMemo(() => {
    if (publicClient.chain.id === baseGoerli.id)
      return new JsonRpcProvider("https://goerli.base.org");
    return new AlchemyProvider(publicClient.chain.id, AlchemyActiveKey);
  }, [publicClient.chain.id]);
};
