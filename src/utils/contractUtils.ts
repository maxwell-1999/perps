import { BaseError, ContractFunctionRevertedError } from 'viem'
import { Address, WalletClient } from 'wagmi'
import { getContract } from 'wagmi/actions'

import { SupportedChainId } from '@/constants/network'
import { PerennialVaultType } from '@/constants/vaults'
import { ChainVaults, ChainVaults2 } from '@/constants/vaults'

import { BalancedVaultAbi } from '@abi/BalancedVault.abi'
import { IProductAbi } from '@abi/IProduct.abi'
import { MarketAbi } from '@abi/v2/Market.abi'
import { OracleAbi } from '@abi/v2/Oracle.abi'
import { PythOracleAbi } from '@abi/v2/PythOracle.abi'
import { VaultAbi } from '@abi/v2/Vault.abi'

export function getVaultAddressForType(vaultType: PerennialVaultType, chainId: SupportedChainId) {
  switch (vaultType) {
    case 'alpha':
      return ChainVaults2[chainId]?.alpha

    case 'bravo':
      return ChainVaults2[chainId]?.bravo
  }
}

export function getVaultForType(vaultType: PerennialVaultType, chainId: SupportedChainId, signer?: WalletClient) {
  const address = getVaultAddressForType(vaultType, chainId)
  if (!address) return
  return getContract({ abi: BalancedVaultAbi, address, walletClient: signer, chainId })
}

export function getVaultForTypeV1(vaultType: PerennialVaultType, chainId: SupportedChainId, signer?: WalletClient) {
  const address = vaultType === 'alpha' ? ChainVaults[chainId].alpha : ChainVaults[chainId].bravo
  if (!address) return
  return getContract({ abi: BalancedVaultAbi, address, walletClient: signer, chainId })
}

export function getVaultContract(vaultAddress: Address, chainId: SupportedChainId, signer?: WalletClient) {
  return getContract({ abi: VaultAbi, address: vaultAddress, walletClient: signer, chainId })
}

export function getProductContract(productAddress: Address, chainId: SupportedChainId) {
  return getContract({ abi: IProductAbi, address: productAddress, chainId })
}

export function getMarketContract(marketAddress: Address, chainId: SupportedChainId) {
  return getContract({ abi: MarketAbi, address: marketAddress, chainId })
}

export function getOracleContract(oracleAddress: Address, chainId: SupportedChainId) {
  return getContract({ abi: OracleAbi, address: oracleAddress, chainId })
}

export function getPythProviderContract(
  pythProviderAddress: Address,
  chainId: SupportedChainId,
  signer?: WalletClient,
) {
  return getContract({ abi: PythOracleAbi, address: pythProviderAddress, chainId, walletClient: signer })
}

export const bufferGasLimit = (estimatedGas: bigint) => (estimatedGas * 3n) / 2n

export function parseViemContractCustomError(err: unknown) {
  if (err instanceof BaseError) {
    const revertError = err.walk((err) => err instanceof ContractFunctionRevertedError)
    if (revertError instanceof ContractFunctionRevertedError) {
      const errorName = revertError.data?.errorName
      return errorName
    }
  }
}
