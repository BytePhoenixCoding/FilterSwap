import { parseUnits } from '@ethersproject/units'
import {
  Currency,
  CurrencyAmount,
  ETHER,
  JSBI,
  Token,
  TokenAmount,
  Trade,
} from '../../custom_modules/@filterswap-libs/sdk'
import { ParsedQs } from 'qs'
import { useCallback, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import useENS from '../../hooks/useENS'
import { useActiveWeb3React } from '../../hooks'
import { useCurrency } from '../../hooks/Tokens'
import useParsedQueryString from '../../hooks/useParsedQueryString'
import { isAddress } from '../../utils'
import { AppDispatch, AppState } from '../index'
import { useCurrencyBalances, useMintFee } from '../wallet/hooks'
import { Field, replaceDeployState } from './actions'
import { selectCurrency, setRecipient, switchCurrencies, typeInput } from '../swap/actions'
import { DeployState } from './reducer'
import { tryParseAmount } from '../swap/hooks'

export function useDeployState(): AppState['deploy'] {
  return useSelector<AppState, AppState['deploy']>((state) => state.swap)
}

export function useDeployActionHandlers(): {
  onCurrencySelection: (field: Field, currency: Currency) => void
  onSwitchTokens: () => void
  onUserInput: (field: Field, typedValue: string) => void
  onChangeRecipient: (recipient: string | null) => void
} {
  const dispatch = useDispatch<AppDispatch>()
  const onCurrencySelection = useCallback(
    (field: Field, currency: Currency) => {
      dispatch(
        selectCurrency({
          field,
          currencyId: currency instanceof Token ? currency.address : currency === ETHER ? 'BNB' : '',
        })
      )
    },
    [dispatch]
  )

  const onSwitchTokens = useCallback(() => {
    dispatch(switchCurrencies())
  }, [dispatch])

  const onUserInput = useCallback(
    (field: Field, typedValue: string) => {
      dispatch(typeInput({ field, typedValue }))
    },
    [dispatch]
  )

  const onChangeRecipient = useCallback(
    (recipient: string | null) => {
      dispatch(setRecipient({ recipient }))
    },
    [dispatch]
  )

  return {
    onSwitchTokens,
    onCurrencySelection,
    onUserInput,
    onChangeRecipient,
  }
}

// from the current deploy inputs, compute the best trade and return it.
export function useDerivedDeployInfo(): {
  currencies: { [field in Field]?: Currency }
  currencyBalances: { [field in Field]?: CurrencyAmount }
  parsedAmount: CurrencyAmount | undefined
  params: object | undefined
  calculatedMintFee: number | undefined
  inputCurrency: CurrencyAmount | undefined
  inputError?: string
} {
  const { account } = useActiveWeb3React()

  const {
    typedValue,
    [Field.INPUT]: { currencyId: inputCurrencyId },
  } = useDeployState()

  const inputCurrency = useCurrency(inputCurrencyId)

  const relevantTokenBalances = useCurrencyBalances(account ?? undefined, [inputCurrency ?? undefined])

  const parsedAmount = tryParseAmount(typedValue, inputCurrency ?? undefined)

  const currencyBalances = {
    [Field.INPUT]: relevantTokenBalances[0],
  }

  const currencies: { [field in Field]?: Currency } = {
    [Field.INPUT]: inputCurrency ?? undefined,
  }

  const calculatedMintFee = useMintFee(Number(typedValue))

  let inputError: string | undefined
  if (!account) {
    inputError = 'Connect Wallet'
  }

  if (!parsedAmount) {
    inputError = inputError ?? 'Enter an amount'
  }

  if (!currencies[Field.INPUT]) {
    inputError = inputError ?? 'Select a token'
  }

  return {
    currencies,
    currencyBalances,
    parsedAmount,
    params: undefined,
    inputError,
    calculatedMintFee,
    inputCurrency: undefined,
  }
}
