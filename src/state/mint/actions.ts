import { createAction } from '@reduxjs/toolkit'

export enum Field {
  CURRENCY_A = 'CURRENCY_A',
  CURRENCY_B = 'CURRENCY_B'
}

export const typeInput = createAction<{
  field: Field;
  typedValue: string;
  noLiquidity: boolean
}>('mint/typeInputMint')
export const resetMintState = createAction<void>('mint/resetMintState')
export const daysToLockChange = createAction<{ daysToLock: number }>('mint/daysToLockChange')
export const toggleLockForever = createAction('mint/toggleLockForever')