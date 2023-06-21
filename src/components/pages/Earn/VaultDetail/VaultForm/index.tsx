import { Flex, FormLabel, Spinner, Text } from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'

import { Button, Container } from '@/components/design-system'
import { DataRow } from '@/components/design-system'
import colors from '@/components/design-system/theme/colors'
import Toggle from '@/components/shared/Toggle'
import { TxButton } from '@/components/shared/TxButton'
import { Form } from '@/components/shared/components'
import { QuoteCurrency } from '@/constants/assets'
import { VaultSnapshot, VaultUserSnapshot } from '@/constants/vaults'
import { useAddress } from '@/hooks/network'
import { useBalances } from '@/hooks/wallet'
import { Big18Math } from '@/utils/big18Utils'
import { formatBig18USDPrice } from '@/utils/big18Utils'

import { Input, Pill } from '@ds/Input'

import ConfirmationModal from './ConfirmationModal'
import { FormNames, FormValues, VaultFormOption, vaultFormOptions } from './constants'
import { useOnAmountChange, useVaultFormCopy, useVaultFormValidators } from './hooks'

export default function VaultForm({
  vaultSnapshot,
  vaultName,
  vaultUserSnapshot,
}: {
  vaultSnapshot: VaultSnapshot
  vaultName: string
  vaultUserSnapshot?: VaultUserSnapshot
}) {
  const copy = useVaultFormCopy()
  const { address } = useAddress()
  const { data: balances } = useBalances()
  const [formValues, setFormValues] = useState<FormValues | null>(null)
  const [vaultOption, setVaultOption] = useState<VaultFormOption>(VaultFormOption.Deposit)

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
    reset()
  }, [vaultOption, reset])

  const onAmountChange = useOnAmountChange(setValue)
  const amount = watch(FormNames.amount)

  const onSubmit = (formData: { amount: string }) => {
    setFormValues(formData)
    reset()
  }

  const onClose = () => {
    setFormValues(null)
  }

  const onCancel = () => {
    setFormValues(null)
    reset()
  }

  const onClickMaxAmount = () => {
    setValue(FormNames.amount, Big18Math.toFloatString(Big18Math.fromDecimals(balances?.usdc ?? 0n, 6)))
  }

  const onClickMaxShares = () => {
    setValue(FormNames.amount, Big18Math.toFloatString(vaultUserSnapshot?.assets ?? 0n))
  }

  const displayAmount = Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(Number(amount))

  const vaultFormValidators = useVaultFormValidators({
    usdcBalance: balances?.usdc ?? 0n,
    vaultAssets: vaultUserSnapshot?.assets ?? 0n,
    vaultFormOption: vaultOption,
  })

  const buttonDisabled = Object.keys(errors).length > 0 || !amount

  const isDeposit = vaultOption === VaultFormOption.Deposit

  if (!vaultUserSnapshot || !vaultSnapshot) {
    return (
      <Container variant="vaultCard" justifyContent="center" alignItems="center" mb="22px" width="100%" height="300px">
        <Spinner />
      </Container>
    )
  }

  return (
    <>
      {!!formValues && (
        <ConfirmationModal
          formValues={formValues}
          balances={balances}
          onClose={onClose}
          onCancel={onCancel}
          vaultOption={vaultOption}
          vaultName={vaultName}
          vaultSnapshot={vaultSnapshot}
          vaultUserSnapshot={vaultUserSnapshot}
        />
      )}
      <Container variant="vaultCard" mb="22px" py={5} px={4}>
        <Form onSubmit={handleSubmit(onSubmit)}>
          <Flex mb="14px">
            <Toggle<VaultFormOption> labels={vaultFormOptions} activeLabel={vaultOption} onChange={setVaultOption} />
          </Flex>
          <Input
            name={FormNames.amount}
            title={copy.Amount}
            placeholder="0.0000"
            control={control}
            labelText={copy.Amount}
            validate={vaultFormValidators}
            onChange={(e) => onAmountChange(e.target.value)}
            isRequired
            rightEl={<Pill text={QuoteCurrency.usd} />}
            rightLabel={
              <FormLabel mr={0} mb={0}>
                {!!address && isDeposit && (
                  <Flex gap={1}>
                    <Text variant="label">
                      {formatBig18USDPrice(balances?.usdc, { fromUsdc: true }) ?? copy.zeroUsd}
                    </Text>
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
                    <Text variant="label">{formatBig18USDPrice(vaultUserSnapshot.assets) ?? copy.zeroUsd}</Text>
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
            mb={5}
          />
          <Flex flexDirection="column" width="100%" mb={5}>
            <DataRow
              mb={3}
              label={copy.ChangeInValue}
              value={
                amount ? (
                  <DisplayAmount amount={displayAmount} isWithdrawal={vaultOption === VaultFormOption.Withdraw} />
                ) : (
                  copy.noValue
                )
              }
            />
            <DataRow label={copy.ChangeInPnL} value={copy.noValue} />
          </Flex>
          <TxButton
            type="submit"
            isDisabled={buttonDisabled}
            label={vaultOption === VaultFormOption.Deposit ? copy.Deposit : copy.Withdraw}
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
