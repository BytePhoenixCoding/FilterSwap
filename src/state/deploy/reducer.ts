import { createReducer } from '@reduxjs/toolkit'
import { Field, replaceDeployState,  } from './actions'
import { selectCurrency, setRecipient, switchCurrencies, typeInput } from '../swap/actions'

export interface DeployState {
  readonly independentField: Field
  readonly typedValue: string
  readonly [Field.INPUT]: {
    readonly currencyId: string | undefined
  }
  // the typed recipient address or ENS name, or null if swap should go to sender
  readonly recipient: string | null
}

const initialState: DeployState = {
  independentField: Field.INPUT,
  typedValue: '',
  [Field.INPUT]: {
    currencyId: '',
  },
  recipient: null,
}

export default createReducer<DeployState>(initialState, (builder) =>
  builder
    .addCase(
      replaceDeployState,
      (state, { payload: { typedValue, recipient, field, inputCurrencyId } }) => {
        return {
          [Field.INPUT]: {
            currencyId: inputCurrencyId,
          },
          independentField: field,
          typedValue,
          recipient,
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
    // .addCase(switchCurrencies, (state) => {
    //   return {
    //     ...state,
    //     independentField: Field.INPUT,
    //     [Field.INPUT]: { currencyId: state[Field.OUTPUT].currencyId },
    //   }
    // })
    // .addCase(typeInput, (state, { payload: { field, typedValue } }) => {
    //   return {
    //     ...state,
    //     independentField: field,
    //     typedValue,
    //   }
    // })
    // .addCase(setRecipient, (state, { payload: { recipient } }) => {
    //   state.recipient = recipient
    // })
)
