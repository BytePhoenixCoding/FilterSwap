import { Text, Button } from '../../custom_modules/@filterswap-libs/uikit'
import { Currency } from '../../custom_modules/@filterswap-libs/sdk'
import { AutoColumn } from '../Column'
import QuestionHelper from '../QuestionHelper'
import { AutoRow, RowBetween, RowFixed } from '../Row'
import { DeployCallbackError } from './styleds'

export default function DeployModalFooter({
  params,
  onConfirm,
  deployErrorMessage,
  disabledConfirm,
  calculatedMintFee,
  inputCurrency,
}: {
  params: object
  onConfirm: () => void
  deployErrorMessage: string | undefined
  disabledConfirm: boolean
  calculatedMintFee: number | undefined
  inputCurrency: Currency | undefined
}) {
  const roundedMintFee = Math.round(((calculatedMintFee || 0) + Number.EPSILON) * 100000) / 100000
  return (
    <>
      <AutoColumn gap="0px">
        <RowBetween>
          <RowFixed>
            <Text fontSize="14px">Token mint fee</Text>
            <QuestionHelper text={'TBA'} /> TODO
          </RowFixed>
          <Text fontSize="14px">
            {roundedMintFee} {inputCurrency?.symbol}
          </Text>
        </RowBetween>
      </AutoColumn>

      <AutoRow>
        <Button onClick={onConfirm} disabled={disabledConfirm} mt="10px" id="confirm-swap-or-send" width="100%">
          Deploy Token
        </Button>

        {deployErrorMessage ? <DeployCallbackError error={deployErrorMessage} /> : null}
      </AutoRow>
    </>
  )
}
