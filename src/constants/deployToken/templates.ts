export const deployTokenTemplates: {
  index: number
  name: string
  description: string
  options: {
    fieldName: string
    id: string
    type?: string
    min?: number
    max?: number
  }[]
}[] = [
  {
    index: 0,
    name: 'Basic',
    description: 'The most basic token template with no fees.',
    options: [
      { fieldName: 'Token Name', id: 'tokenName' },
      { fieldName: 'Token Symbol', id: 'tokenSymbol' },
      { fieldName: 'Total Supply', id: 'totalSupply', type: 'number' },
    ],
  },
  {
    index: 1,
    name: 'Deflationary (basic transfer fee)',
    description:
      'Like the basic token template, but a fee of up to 25% is taken for every transfer. Owner can change fees and all collected fees are burnt.',
    options: [
      { fieldName: 'Token Name', id: 'tokenName' },
      { fieldName: 'Token Symbol', id: 'tokenSymbol' },
      { fieldName: 'Total Supply', id: 'totalSupply', type: 'number', min: 0 },
      { fieldName: 'Transfer Fee (0-25%)', id: 'transferFee', type: 'percent', min: 0, max: 25 },
    ],
  },
  {
    index: 2,
    name: 'Deflationary (buy/sell fee)',
    description:
      'Like the basic token template, but a buy and sell fee of up to 25% each is taken for every swap. Fees are only active when token is bought / sold via FilterSwap. Owner can change fees and all collected fees are burnt.',
    options: [
      { fieldName: 'Token Name', id: 'tokenName' },
      { fieldName: 'Token Symbol', id: 'tokenSymbol' },
      { fieldName: 'Total Supply', id: 'totalSupply', type: 'number', min: 0 },
      { fieldName: 'Buy Fee (0-25%)', id: 'buyFee', type: 'percent', min: 0, max: 25 },
      { fieldName: 'Sell Fee (0-25%)', id: 'sellFee', type: 'percent', min: 0, max: 25 },
    ],
  },
]
