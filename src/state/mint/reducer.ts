import { createReducer } from '@reduxjs/toolkit'
import { Field, resetMintState, typeInput } from './actions'
import { daysToLockChange, toggleLockForever } from '../deploy/actions'


export interface MintState {
  readonly independentField: Field
  readonly typedValue: string
  readonly otherTypedValue: string // for the case when there's no liquidity
  readonly daysToLock: number
  readonly lockForever: boolean
}

const initialState: MintState = {
  independentField: Field.CURRENCY_A,
  typedValue: '',
  otherTypedValue: '',
  daysToLock: process.env.REACT_APP_LIQUIDITY_RECOMMENDED_LOCK_TIME,
  lockForever: false,
}

export default createReducer<MintState>(initialState, builder =>
  builder
    .addCase(resetMintState, () => initialState)
    .addCase(typeInput, (state, { payload: { field, typedValue, noLiquidity } }) => {
      if (noLiquidity) {
        // they're typing into the field they've last typed in
        if (field === state.independentField) {
          return {
            ...state,
            independentField: field,
            typedValue
          }
        }
        // they're typing into a new field, store the other value
        
          return {
            ...state,
            independentField: field,
            typedValue,
            otherTypedValue: state.typedValue
          }
        
      } 
        return {
          ...state,
          independentField: field,
          typedValue,
          otherTypedValue: ''
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
)
