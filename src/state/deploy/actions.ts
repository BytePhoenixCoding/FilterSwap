import { createAction } from '@reduxjs/toolkit'

export enum Field {
  INPUT = 'INPUT',
  OUTPUT = 'OUTPUT'
}

// export const typeInput = createAction<{ field: Field; typedValue: string; noLiquidity: boolean }>('mint/typeInputMint')
// export const resetMintState = createAction<void>('mint/resetMintState')

export const replaceDeployState = createAction<{
  field: Field
  typedValue: string
  inputCurrencyId?: string
  recipient: string | null
}>('deploy/replaceDeployState')