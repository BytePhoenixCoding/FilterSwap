import React, { useMemo, useState } from 'react'
import { Text, Button } from '../../custom_modules/@filterswap-libs/uikit'
import { Repeat } from 'react-feather'

import useI18n from 'hooks/useI18n'
import { Field } from '../../state/swap/actions'
import {
  computeSlippageAdjustedAmounts,
  computeTradePriceBreakdown,
  formatExecutionPrice,
  warningSeverity,
} from '../../utils/prices'
import { AutoColumn } from '../Column'
import QuestionHelper from '../QuestionHelper'
import { AutoRow, RowBetween, RowFixed } from '../Row'
import FormattedPriceImpact from './FormattedPriceImpact'
import { StyledBalanceMaxMini, DeployCallbackError } from './styleds'

export default function DeployModalFooter({
  params,
  onConfirm,
  allowedSlippage,
  deployErrorMessage,
  disabledConfirm,
  calculatedMintFee,
}: {
  params: object
  allowedSlippage: number
  onConfirm: () => void
  deployErrorMessage: string | undefined
  disabledConfirm: boolean
  calculatedMintFee: number | undefined
}) {
  const [showInverted, setShowInverted] = useState<boolean>(false)
  // const { priceImpactWithoutFee, realizedLPFee } = useMemo(() => computeTradePriceBreakdown(params), [params])
  // const severity = warningSeverity(priceImpactWithoutFee)
  const TranslateString = useI18n()

  // const calculatedMintFee = calculatedMintFee
  const mintSymbol = ''

  return (
    <>
      <AutoColumn gap="0px">
        <RowBetween>
          <RowFixed>
            {/* <Text fontSize="14px">
              {trade.tradeType === TradeType.EXACT_INPUT
                ? TranslateString(1210, 'Minimum received')
                : TranslateString(220, 'Maximum sold')}
            </Text> */}
            <Text fontSize="14px">Token Mint Fee</Text>
            {/* <QuestionHelper text={'Todo'} /> TODO */}
          </RowFixed>
          <Text fontSize="14px">{calculatedMintFee}</Text>
          {/* <RowFixed>
            <Text fontSize="14px">
              {trade.tradeType === TradeType.EXACT_INPUT
                ? slippageAdjustedAmounts[Field.OUTPUT]?.toSignificant(4) ?? '-'
                : slippageAdjustedAmounts[Field.INPUT]?.toSignificant(4) ?? '-'}
            </Text>
            <Text fontSize="14px" marginLeft="4px">
              {trade.tradeType === TradeType.EXACT_INPUT
                ? trade.outputAmount.currency.symbol
                : trade.inputAmount.currency.symbol}
            </Text>
          </RowFixed> */}
        </RowBetween>
      </AutoColumn>

      <AutoRow>
        <Button
          onClick={onConfirm}
          disabled={disabledConfirm}
          // variant={severity > 2 ? 'danger' : 'primary'}
          mt="10px"
          id="confirm-swap-or-send"
          width="100%"
        >
          Deploy Token
        </Button>

        {deployErrorMessage ? <DeployCallbackError error={deployErrorMessage} /> : null}
      </AutoRow>
    </>
  )
}
