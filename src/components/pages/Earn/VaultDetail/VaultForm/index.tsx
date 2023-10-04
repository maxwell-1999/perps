import { Flex, FormLabel, Spinner, Text } from '@chakra-ui/react'
import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { arbitrum } from 'viem/chains'

import { TrackingEvents, useMixpanel } from '@/analytics'
import { Button, Container } from '@/components/design-system'
import { DataRow } from '@/components/design-system'
import colors from '@/components/design-system/theme/colors'
import Toggle from '@/components/shared/Toggle'
import { TxButton } from '@/components/shared/TxButton'
import { Form, USDCETooltip } from '@/components/shared/components'
import { QuoteCurrency } from '@/constants/markets'
import { useMigrationContext } from '@/contexts/migrationContext'
import { useAddress } from '@/hooks/network'
import { useChainId } from '@/hooks/network'
import { VaultAccountSnapshot2, VaultSnapshot2 } from '@/hooks/vaults2'
import { Balances, useOperators } from '@/hooks/wallet'
import { Big6Math, formatBig6USDPrice } from '@/utils/big6Utils'
import { Big18Math } from '@/utils/big18Utils'

import { Input, Pill } from '@ds/Input'

import ConfirmationModal from './ConfirmationModal'
import { FormNames, FormValues, VaultFormOption, vaultFormOptions } from './constants'
import { useOnAmountChange, useVaultFormCopy, useVaultFormValidators } from './hooks'

export default function VaultForm({
  vaultSnapshot,
  vaultName,
  vaultUserSnapshot,
  balances,
}: {
  vaultSnapshot: VaultSnapshot2
  vaultName: string
  vaultUserSnapshot?: VaultAccountSnapshot2
  balances: Balances
}) {
  const formRef = useRef<HTMLFormElement>(null)
  const copy = useVaultFormCopy()
  const { address } = useAddress()
  const chainId = useChainId()
  const [formValues, setFormValues] = useState<FormValues | null>(null)
  const [vaultOption, setVaultOption] = useState<VaultFormOption>(VaultFormOption.Deposit)
  const [maxWithdrawal, setMaxWithdrawal] = useState(false)
  const { withdrawnAmount, setWithdrawnAmount } = useMigrationContext()
  const { data: operatorApprovals } = useOperators()
  const { track } = useMixpanel()

  const {
    handleSubmit,
    control,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      [FormNames.amount]: '',
    },
  })

  useEffect(() => {
    if (withdrawnAmount > 0n && !!balances?.usdcAllowance) {
      setVaultOption(VaultFormOption.Deposit)
      const amount = Big6Math.max6Decimals(Big18Math.toFloatString(withdrawnAmount))
      setFormValues({ amount })
      setWithdrawnAmount(0n)
      reset()
      track(TrackingEvents.initiateV1ToV2VaultDeposit, {
        amount,
        vaultName,
      })
    }
  }, [withdrawnAmount, setValue, reset, formValues, balances, setWithdrawnAmount, track, vaultName])

  useEffect(() => {
    reset()
    setMaxWithdrawal(false)
  }, [vaultOption, reset])

  const onAmountChange = useOnAmountChange(setValue)
  const amount = watch(FormNames.amount)

  const onSubmit = (formData: { amount: string }) => {
    setFormValues(formData)
    reset()
  }

  const onClose = () => {
    setFormValues(null)
    setMaxWithdrawal(false)
  }

  const onCancel = () => {
    setFormValues(null)
    setMaxWithdrawal(false)
    reset()
  }

  const onClickMaxAmount = () => {
    setValue(FormNames.amount, Big6Math.toFloatString(Big6Math.fromDecimals(balances?.usdc ?? 0n, 6)), {
      shouldDirty: true,
      shouldValidate: true,
    })
  }

  const onClickMaxShares = () => {
    setMaxWithdrawal(true)
    setValue(FormNames.amount, Big6Math.toFloatString(vaultUserSnapshot?.assets ?? 0n), {
      shouldDirty: true,
      shouldValidate: true,
    })
  }

  const displayAmount = formatBig6USDPrice(Big6Math.fromFloatString(amount))

  const vaultFormValidators = useVaultFormValidators({
    usdcBalance: balances?.usdc ?? 0n,
    vaultAssets: vaultUserSnapshot?.assets ?? 0n,
    vaultFormOption: vaultOption,
  })

  const isDeposit = vaultOption === VaultFormOption.Deposit
  const buttonDisabled = Object.keys(errors).length > 0 || !amount || Number(amount) === 0

  if (!vaultSnapshot) {
    return (
      <Container variant="vaultCard" justifyContent="center" alignItems="center" mb="22px" width="100%" height="270px">
        <Spinner />
      </Container>
    )
  }

  const hasAssets = !Big6Math.isZero(vaultUserSnapshot?.assets ?? 0n)
  const userBalance = formatBig6USDPrice(balances?.usdc, { fromUsdc: true }) ?? copy.zeroUsd

  return (
    <>
      {!!formValues && vaultUserSnapshot && (
        <ConfirmationModal
          formValues={formValues}
          balances={balances}
          onClose={onClose}
          onCancel={onCancel}
          vaultOption={vaultOption}
          vaultName={vaultName}
          vaultSnapshot={vaultSnapshot}
          vaultUserSnapshot={vaultUserSnapshot}
          maxWithdrawal={maxWithdrawal}
          operatorApproved={!!operatorApprovals?.vaultFactoryApproved}
        />
      )}
      <Container variant="vaultCard" mb="22px" py={5} px={4}>
        <Form onSubmit={handleSubmit(onSubmit)} ref={formRef}>
          <Flex mb="14px">
            <Toggle<VaultFormOption>
              labels={vaultFormOptions}
              activeLabel={vaultOption}
              onChange={setVaultOption}
              overrideValue={!hasAssets ? VaultFormOption.Deposit : undefined}
              activeColor={vaultOption === VaultFormOption.Deposit ? colors.brand.green : colors.brand.purple[300]}
            />
          </Flex>
          <Input
            name={FormNames.amount}
            title={copy.Amount}
            placeholder="0.0000"
            control={control}
            label={copy.Amount}
            validate={vaultFormValidators}
            onChange={(e) => onAmountChange(e.target.value)}
            rightEl={<Pill text={QuoteCurrency.usd} />}
            rightLabel={
              <FormLabel mr={0} mb={0}>
                {!!address && isDeposit && (
                  <Flex gap={1}>
                    {chainId === arbitrum.id ? (
                      <USDCETooltip userBalance={userBalance} />
                    ) : (
                      <Text variant="label">{userBalance}</Text>
                    )}
                    <Button
                      variant="text"
                      padding={0}
                      height="unset"
                      label={copy.max}
                      size="xs"
                      textDecoration="underline"
                      onClick={onClickMaxAmount}
                    />
                  </Flex>
                )}
                {!!address && !isDeposit && (
                  <Flex gap={1}>
                    <Text variant="label">{formatBig6USDPrice(vaultUserSnapshot?.assets) ?? copy.zeroUsd}</Text>
                    <Button
                      variant="text"
                      padding={0}
                      height="unset"
                      label={copy.max}
                      size="xs"
                      textDecoration="underline"
                      onClick={onClickMaxShares}
                    />
                  </Flex>
                )}
              </FormLabel>
            }
          />
          <Flex flexDirection="column" width="100%" my={5}>
            <DataRow
              mb={3}
              label={copy.ChangeInValue}
              value={
                amount ? (
                  <DisplayAmount amount={displayAmount} isWithdrawal={vaultOption === VaultFormOption.Redeem} />
                ) : (
                  copy.noValue
                )
              }
            />
            {amount && (
              <DataRow
                mb={3}
                label={copy.SettlementFee}
                value={
                  amount ? (
                    <DisplayAmount
                      amount={formatBig6USDPrice(
                        vaultSnapshot.totalSettlementFee * (vaultOption === VaultFormOption.Redeem ? 2n : 1n),
                        { compact: true },
                      )}
                      isWithdrawal={true}
                    />
                  ) : (
                    copy.noValue
                  )
                }
              />
            )}
          </Flex>
          <TxButton
            type="submit"
            formRef={formRef}
            isDisabled={buttonDisabled}
            label={vaultOption === VaultFormOption.Deposit ? copy.Deposit : copy.Redeem}
            overrideLabel
            actionAllowedInGeoblock={vaultOption === VaultFormOption.Redeem} // allow redeem in geoblock
            skipMarketFactoryApproval // not needed for deposit/redeem
          />
        </Form>
      </Container>
    </>
  )
}

const DisplayAmount = ({ amount, isWithdrawal }: { amount: string; isWithdrawal: boolean }) => (
  <Text fontSize="14px">
    <Text as="span" fontWeight="bold" color={isWithdrawal ? colors.brand.red : colors.brand.green} mr={1}>
      {/* eslint-disable-next-line formatjs/no-literal-string-in-jsx */}
      {isWithdrawal ? '-' : '+'}
    </Text>
    {amount}
  </Text>
)
