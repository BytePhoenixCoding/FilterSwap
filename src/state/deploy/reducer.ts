import { createReducer } from '@reduxjs/toolkit'
import { Field, replaceDeployState,  } from './actions'
import { selectCurrency, setRecipient, switchCurrencies, typeInput } from '../swap/actions'
import { Currency } from 'custom_modules/@filterswap-libs/sdk/dist/sdk.esm'

export interface DeployState {
  readonly independentField: Field
  readonly typedValue: string
  readonly [Field.INPUT]: {
    readonly currencyId: string | undefined
  }
  readonly [Field.OUTPUT]: {
    readonly currencyId: string | undefined
  }
  readonly params: object
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
    
  }
}

export default createReducer<DeployState>(initialState, (builder) =>
  builder
    .addCase(
      replaceDeployState,
      (state, { payload: { typedValue, field, inputCurrencyId, params } }) => {
        return {
          [Field.INPUT]: {
            currencyId: inputCurrencyId,
          },
          [Field.OUTPUT]: {
            currencyId: inputCurrencyId,
          },
          independentField: field,
          typedValue,
          params
        }
      }
    )
    .addCase(selectCurrency, (state, { payload: { currencyId, field } }) => {
      const otherField = Field.INPUT
      // the normal case
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
)
