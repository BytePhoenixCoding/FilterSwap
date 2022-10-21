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

  ownerShare: number
  liquidityShare: number

  daysToLock: number
  lockForever: boolean
  params: object

  selectedTemplate: number,
  createOptions
}>('deploy/replaceDeployState')
export const ownerShareChange = createAction<{ ownerShare: number, liquidityShare: number }>('deploy/ownerShareChange')
export const daysToLockChange = createAction<{ daysToLock: number }>('deploy/daysToLockChange')
export const toggleLockForever = createAction('deploy/toggleLockForever')
export const paramsChange = createAction<{ id: string, value: any }>('deploy/paramsChange')
export const templateChange = createAction<{templateId: number}>('deploy/templateChange')
