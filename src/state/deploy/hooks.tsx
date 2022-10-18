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
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useActiveWeb3React } from '../../hooks'
import { useCurrency } from '../../hooks/Tokens'
import { AppDispatch, AppState } from '../index'
import { useCurrencyBalances, useMintFee } from '../wallet/hooks'
import { Field, replaceDeployState } from './actions'
import { selectCurrency, setRecipient, switchCurrencies, typeInput } from '../swap/actions'
import { DeployState } from './reducer'
import { tryParseAmount } from '../swap/hooks'
import { deployTokenTemplates } from '../../constants/deployToken/templates'

// Todo: Break components out for efficiency

export function useDeployState(): AppState['deploy'] {
  return useSelector<AppState, AppState['deploy']>((state) => state.deploy)
}

export function useDeployActionHandlers(): {
  onCurrencySelection: (field: Field, currency: Currency) => void
  onSwitchTokens: () => void
  onUserInput: (field: Field, typedValue: string) => void
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

  return {
    onSwitchTokens,
    onCurrencySelection,
    onUserInput,
  }
}

export function useDerivedDeployInfo(): {
  currencies: { [field in Field]?: Currency }
  currencyBalances: { [field in Field]?: CurrencyAmount }
  parsedAmount: CurrencyAmount | undefined
  calculatedMintFee: number | undefined
  inputCurrency: CurrencyAmount | undefined
  params: object
  handleParamChange
  createOptions
  selectTemplates
  selectedTemplate: number
  handleSelectChange
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

  // Create the default parameters using all unique fieldName options
  const allFieldNames = useMemo(() => {
    const allFields = [
      ...new Map(
        deployTokenTemplates
          .map((template) => template.options)
          .flat()
          .map((item) => [item['fieldName'], item])
      ).values(),
    ]

    const allFieldsWithValues = allFields
      .map((e) => ({
        ...e,
        value: e.type == 'number' ? '0' : '',
      }))
      .reduce((ac, a) => ({ ...ac, [a.id]: a.value }), {})

    return allFieldsWithValues
  }, [deployTokenTemplates])

  const [newTokenParams, setNewTokenParams] = useState<any>(allFieldNames)

  // For quick testing:
  // useEffect(() => {
  //   setNewTokenParams({
  //     tokenName: 'ASDer',
  //     tokenSymbol: 'ASD',
  //     totalSupply: '9',
  //     transferFee: '1',
  //     buyFee: '2',
  //     sellFee: '3',
  //   })
  // }, [])

  const [selectedTemplate, setSelectedTemplate] = useState(0)

  const handleParamChange = (e) => {
    setNewTokenParams({
      ...newTokenParams,
      [e.target.id]: e.target.value,
    })
  }

  const [createOptions, setCreateOptions] = useState(deployTokenTemplates[selectedTemplate])
  const handleSelectChange = (e) => {
    const index = e.target.selectedIndex
    setCreateOptions(deployTokenTemplates[index])
    setSelectedTemplate(index)
  }

  let inputError: string | undefined
  if (!account) {
    inputError = 'Connect Wallet'
  }

  if (!currencies[Field.INPUT]) {
    inputError = inputError ?? 'Select a token'
  }

  if (currencies[Field.INPUT]?.verified == undefined) {
    inputError = inputError ?? 'Base Token Verification Loading'
  }

  if (!currencies[Field.INPUT]?.verified) {
    inputError = inputError ?? 'Base Token is not Verified'
  }

  if (!parsedAmount) {
    inputError = inputError ?? 'Enter Base Token Amount'
  }

  Object.entries(newTokenParams).forEach((param: any, i) => {
    if ((!param[1] || param[1] == '0') && createOptions.options.map((e) => e.id).includes(param[0])) {
      inputError = inputError ?? 'Enter ' + createOptions.options[i].fieldName
    }
  })

  return {
    currencies,
    currencyBalances,
    parsedAmount,
    calculatedMintFee,
    params: newTokenParams,
    handleParamChange,
    selectedTemplate,
    createOptions,
    selectTemplates: deployTokenTemplates,
    handleSelectChange,
    inputError,
    inputCurrency: undefined,
  }
}
