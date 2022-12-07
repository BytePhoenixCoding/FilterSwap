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
    description: 'The most basic token template. No fees, nothing.',
    options: [
      { fieldName: 'Token Name', id: 'tokenName' },
      { fieldName: 'Token Symbol', id: 'tokenSymbol' },
      { fieldName: 'Total Supply', id: 'totalSupply', type: 'number' },
    ],
  },
  {
    index: 1,
    name: 'Deflationary (simple transfer fee)',
    description:
      'Like the basic token template, but a fee of up to 25% is taken for each transfer. All collected fees are burnt.',
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
      'Like the basic token template, but a buy and sell fee of up to 25% each can be implemented and changed at any time by the owner. All collected fees are burnt.',
    options: [
      { fieldName: 'Token Name', id: 'tokenName' },
      { fieldName: 'Token Symbol', id: 'tokenSymbol' },
      { fieldName: 'Total Supply', id: 'totalSupply', type: 'number', min: 0 },
      { fieldName: 'Buy Fee (0-25%)', id: 'buyFee', type: 'percent', min: 0, max: 25 },
      { fieldName: 'Sell Fee (0-25%)', id: 'sellFee', type: 'percent', min: 0, max: 25 },
    ],
  },
]