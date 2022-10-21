import { createReducer } from '@reduxjs/toolkit'
import { Field, replaceDeployState, ownerShareChange, daysToLockChange, toggleLockForever, paramsChange, templateChange } from './actions'
import { selectCurrency, setRecipient, switchCurrencies, typeInput } from '../swap/actions'
import { Currency } from 'custom_modules/@filterswap-libs/sdk/dist/sdk.esm'
import { deployTokenTemplates } from '../../constants/deployToken/templates'

export interface DeployState {
  readonly independentField: Field
  readonly typedValue: string
  readonly [Field.INPUT]: {
    readonly currencyId: string | undefined
  }
  readonly [Field.OUTPUT]: {
    readonly currencyId: string | undefined
  }
  readonly params: any
  readonly ownerShare: number
  readonly liquidityShare: number
  readonly daysToLock: number
  readonly lockForever: boolean
  readonly selectedTemplate: number
  readonly createOptions: {
    description: string
    name: string
    options: {
      fieldName: string
      id: string
      type?: string
      value?: number
      min?: number
      max?: number
    }[]
  }
}

const initialState: DeployState = {
  independentField: Field.INPUT,
  typedValue: '',
  [Field.INPUT]: {
    currencyId: Currency.ETHER.symbol,
  },
  [Field.OUTPUT]: {
    currencyId: '',
  },
  params: {
    tokenName: '',
    tokenSymbol: '',
    totalSupply: '1000000',
    transferFee: '',
    buyFee: '',
    sellFee: '',
  },
  ownerShare: 0,
  liquidityShare: 100,
  daysToLock: 14,
  lockForever: false,
  selectedTemplate: 0,
  createOptions: deployTokenTemplates[0]
}

export default createReducer<DeployState>(initialState, (builder) =>
  builder
    .addCase(
      replaceDeployState,
      (state, { payload: {
        typedValue,
        field,
        inputCurrencyId,
        params,
        ownerShare,
        liquidityShare,
        daysToLock,
        lockForever,
        selectedTemplate,
        createOptions
      } }) => {
        return {
          [Field.INPUT]: {
            currencyId: inputCurrencyId,
          },
          [Field.OUTPUT]: {
            currencyId: inputCurrencyId,
          },
          independentField: field,
          typedValue,
          params,
          ownerShare,
          liquidityShare,
          daysToLock,
          lockForever,
          selectedTemplate,
          createOptions
        }
      }
    )
    .addCase(selectCurrency, (state, { payload: { currencyId, field } }) => {
      return {
        ...state,
				independentField: Field.INPUT,
				[field]: { currencyId },
      }
    })
    .addCase(typeInput, (state, { payload: { field, typedValue } }) => {
      return {
        ...state,
        independentField: field,
        typedValue,
      }
    })
    .addCase(ownerShareChange, (state, { payload: { ownerShare, liquidityShare } }) => {
      return {
        ...state,
        ownerShare,
        liquidityShare
      }
    })
    .addCase(daysToLockChange, (state, { payload: { daysToLock } }) => {
      return {
        ...state,
        daysToLock
      }
    })
    .addCase(toggleLockForever, (state) => {
      return {
        ...state,
        lockForever: !state.lockForever,
      }
    })
    .addCase(paramsChange, (state, { payload: { id, value } }) => {
      return {
        ...state,
        params: {
          ...(state.params),
          [id]: value
        }
      }
    })
    .addCase(templateChange, (state, { payload: { templateId } }) => {

      console.log(templateId)
      
      const selectedTemplate = templateId
      const createOptions = deployTokenTemplates[selectedTemplate]
      console.log(deployTokenTemplates)
      console.log(createOptions)
      console.log(selectedTemplate)
      
      return {
        ...state,
        createOptions,
        selectedTemplate
      }
    })
)
