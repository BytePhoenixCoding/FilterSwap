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
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useActiveWeb3React } from '../../hooks'
import { useCurrency } from '../../hooks/Tokens'
import { AppDispatch, AppState } from '../index'
import { useCurrencyBalances, useMintFee } from '../wallet/hooks'
import {
  Field,
  ownerShareChange,
  daysToLockChange,
  toggleLockForever,
  paramsChange,
  templateChange,
  updateNewTokenAddress,
} from './actions'
import { selectCurrency, switchCurrencies, typeInput } from '../swap/actions'
import { DeployState } from './reducer'
import { tryParseAmount } from '../swap/hooks'
import { DEPLOYER_MAX_OWNER_SHARE } from '../../constants/index'

export function useDeployState(): AppState['deploy'] {
  return useSelector<AppState, AppState['deploy']>((state) => {
    return state.deploy
  })
}

export function useDeployActionHandlers(): {
  onCurrencySelection: (field: Field, currency: Currency) => void
  onSwitchTokens: () => void
  onUserInput: (field: Field, typedValue: string) => void
  onOwnerShareChange: (ownerShare: number, liquidityShare: number) => void
  onDaysToLockChange: (daysToLock: number) => void
  onToggleLockForever: () => void
  onParamsChange: (params) => void
  onTemplateChange: (templateId: number) => void
  onNewTokenAddress: (newTokenAddress: string) => void
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

  const onOwnerShareChange = useCallback(
    (ownerShare: number, liquidityShare: number) => {
      dispatch(ownerShareChange({ ownerShare, liquidityShare }))
    },
    [dispatch]
  )

  const onDaysToLockChange = useCallback(
    (daysToLock: number) => {
      dispatch(daysToLockChange({ daysToLock }))
    },
    [dispatch]
  )
  const onToggleLockForever = useCallback(() => {
    dispatch(toggleLockForever())
  }, [dispatch])

  const onParamsChange = useCallback(
    (params) => {
      dispatch(paramsChange(params))
    },
    [dispatch]
  )

  const onTemplateChange = useCallback(
    (templateId: number) => {
      dispatch(templateChange({ templateId }))
    },
    [dispatch]
  )
  const onNewTokenAddress = useCallback(
    (newTokenAddress) => {
      dispatch(updateNewTokenAddress({ newTokenAddress }))
    },
    [dispatch]
  )

  // TODO

  return {
    onSwitchTokens,
    onCurrencySelection,
    onUserInput,
    onOwnerShareChange,
    onDaysToLockChange,
    onToggleLockForever,
    onParamsChange,
    onTemplateChange,
    onNewTokenAddress,
  }
}

export function useDaysToLock(): {
  handleDaysToLockChange
  handleLockForever
} {
  const { onDaysToLockChange, onToggleLockForever } = useDeployActionHandlers()
  const handleDaysToLockChange = useCallback(
    (evt: React.ChangeEvent<HTMLInputElement>) => {
      const { value: inputValue } = evt.target

      const num: number = parseFloat(inputValue) || 0
      const min: number = parseFloat(evt.target.min || '-1')
      const max: number = parseFloat(evt.target.max || '1000000000000')

      onDaysToLockChange(Math.min(Math.max(num, min), max))
    },
    [onDaysToLockChange]
  )
  const handleLockForever = useCallback(() => {
    onToggleLockForever()
  }, [onToggleLockForever])

  return {
    handleDaysToLockChange,
    handleLockForever,
  }
}

export function useParams(): {
  handleParamsChange
} {
  const { onParamsChange } = useDeployActionHandlers()

  const handleParamsChange = useCallback(
    (evt: React.ChangeEvent<HTMLInputElement>) => {
      const dataType = evt.target.dataset.type

      let value
      if (!dataType) {
        value = evt.target.value
      } else {
        const min = parseInt(evt.target.min || '0')
        const max = parseInt(evt.target.max) || Number.MAX_SAFE_INTEGER

        value = Math.max(min, Math.min(max, Math.floor(parseFloat(evt.target.value || '0') * 100) / 100))
      }

      onParamsChange({
        id: evt.target.id,
        value: value,
      })
    },
    [onParamsChange]
  )

  return {
    handleParamsChange,
  }
}

export function useNewTokenAddress(): {
  handleNewTokenAddress
} {
  const { onNewTokenAddress } = useDeployActionHandlers()

  const handleNewTokenAddress = useCallback(
    (newTokenAddress) => {
      onNewTokenAddress(newTokenAddress)
    },
    [onNewTokenAddress]
  )

  return {
    handleNewTokenAddress,
  }
}

export function useOwnerShare(): {
  handleOwnerShareChange
  handleLiquidityShareChange
} {
  const maxOwnerShare = DEPLOYER_MAX_OWNER_SHARE
  const { onOwnerShareChange } = useDeployActionHandlers()

  const handleOwnerShareChange = useCallback(
    (evt: React.ChangeEvent<HTMLInputElement>) => {
      let value = Math.floor(parseFloat(evt.target.value || '0') * 100) / 100

      if (value > maxOwnerShare) {
        value = maxOwnerShare
      }
      onOwnerShareChange(value, 100 - value)
    },
    [onOwnerShareChange]
  )
  const handleLiquidityShareChange = useCallback(
    (evt: React.ChangeEvent<HTMLInputElement>) => {
      let value = Math.round(parseFloat(evt.target.value || '0') * 100) / 100

      if (value < 100 - maxOwnerShare) {
        value = 100 - maxOwnerShare
      } else if (value > 100) {
        value = 100
      }
      onOwnerShareChange(100 - value, value)
    },
    [onOwnerShareChange]
  )

  return {
    handleOwnerShareChange,
    handleLiquidityShareChange,
  }
}

export function useTemplates(): {
  handleTemplateChange
} {
  const { onTemplateChange } = useDeployActionHandlers()

  const handleTemplateChange = useCallback(
    (evt: any) => {
      const templateId = parseInt(evt.target.selectedIndex)

      onTemplateChange(templateId)
    },
    [onTemplateChange]
  )

  return {
    handleTemplateChange,
  }
}

export function useDerivedDeployInfo(): {
  currencies: { [field in Field]?: Currency }
  currencyBalances: { [field in Field]?: CurrencyAmount }
  parsedAmount: CurrencyAmount | undefined
  calculatedMintFee: CurrencyAmount | undefined
  inputCurrency: CurrencyAmount | undefined

  inputError?: string
} {
  const { account } = useActiveWeb3React()

  const {
    typedValue,
    [Field.INPUT]: { currencyId: inputCurrencyId },
    params,
    createOptions,
  } = useDeployState()

  const inputCurrency = useCurrency(inputCurrencyId)

  const relevantTokenBalances = useCurrencyBalances(account ?? undefined, [inputCurrency ?? undefined])

  const parsedAmount = tryParseAmount(typedValue || '0', inputCurrency ?? undefined)

  const currencyBalances = {
    [Field.INPUT]: relevantTokenBalances[0],
  }

  const currencies: { [field in Field]?: Currency } = {
    [Field.INPUT]: inputCurrency ?? undefined,
  }

  const calculatedMintFee = parsedAmount ? useMintFee(parsedAmount) : undefined

  let inputError: string | undefined
  if (!account) {
    inputError = 'Connect Wallet'
  }

  if (!currencies[Field.INPUT]) {
    inputError = inputError ?? 'Select a token'
  }

  if (currencies[Field.INPUT]?.verified == undefined) {
    inputError = inputError ?? 'Base token verification loading...'
  }

  if (!currencies[Field.INPUT]?.verified) {
    inputError = inputError ?? 'Base token is not verified!'
  }

  if (!parsedAmount) {
    inputError = inputError ?? 'Enter base token amount'
  }

  Object.entries(params).forEach((param: any, i) => {
    if (createOptions && (!param[1] || param[1] == '0') && typeof param[1] != "number" && createOptions.options.map((e) => e.id).includes(param[0])) {
      inputError = inputError ?? 'Enter ' + createOptions.options[i]?.fieldName
    }
  })

  return {
    currencies,
    currencyBalances,
    parsedAmount,
    calculatedMintFee,
    inputError,
    inputCurrency: undefined,
  }
}
