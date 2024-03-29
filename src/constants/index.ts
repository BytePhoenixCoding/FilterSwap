import { ChainId, JSBI, Percent, Token, WETH } from '../custom_modules/@filterswap-libs/sdk'

export const CHAIN_ID: number = Number(<string>process.env.REACT_APP_CHAIN_ID)
export const FACTORY_ADDRESS: string = <string>process.env.REACT_APP_FACTORY_ADDRESS
export const ROUTER_ADDRESS: string = <string>process.env.REACT_APP_ROUTER_ADDRESS
export const INIT_CODE_HASH: string = <string>process.env.REACT_APP_INIT_CODE_HASH
export const MANAGER_ADDRESS = <string>process.env.REACT_APP_MANAGER_ADDRESS;
export const DEPLOYER_ADDRESS = <string>process.env.REACT_APP_DEPLOYER_ADDRESS;
export const VERIFIER_ADDRESS = <string>process.env.REACT_APP_VERIFIER_ADDRESS;


export const DEPLOYER_MINT_FEE = Number(process.env.REACT_APP_DEPLOYER_MINT_FEE)
export const DEPLOYER_MAX_OWNER_SHARE = Number(process.env.REACT_APP_DEPLOYER_MAX_OWNER_SHARE)
export const LIQUIDITY_MIN_LOCK_TIME = Number(process.env.REACT_APP_LIQUIDITY_MIN_LOCK_TIME)
export const LIQUIDITY_RECOMMENDED_LOCK_TIME = Number(<string>process.env.REACT_APP_LIQUIDITY_RECOMMENDED_LOCK_TIME)
export const VERIFICATION_REQUEST_FEE = Number(process.env.REACT_APP_VERIFICATION_REQUEST_FEE)
export const VERIFICATION_REQUEST_DEADLINE = Number(process.env.REACT_APP_VERIFICATION_REQUEST_DEADLINE)
export const GOVERNANCE_TOKEN = <string>process.env.REACT_APP_GOVERNANCE_TOKEN

// a list of tokens by chain
type ChainTokenList = {
  readonly [chainId in ChainId]: Token[]
}

export const CAKE = new Token(ChainId.BSCTESTNET, '0x0000000000000000000000000000000000000000', 18, 'FLTPL', 'FilterSwap Token PlaceHolder')
export const WBNB = new Token(ChainId.BSCTESTNET, '0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd', 18, 'WBNB', 'Wrapped BNB')
export const DAI = new Token(ChainId.BSCTESTNET, '0x8a9424745056Eb399FD19a0EC26A14316684e274', 18, 'DAI', 'Dai Stablecoin')
export const BUSD = new Token(ChainId.BSCTESTNET, '0x78867BbEeF44f2326bF8DDd1941a4439382EF2A7', 18, 'BUSD', 'Binance USD')
export const BTCB = new Token(ChainId.BSCTESTNET, '0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c', 18, 'BTCB', 'Binance BTC')
export const USDT = new Token(ChainId.BSCTESTNET, '0x55d398326f99059fF775485246999027B3197955', 18, 'USDT', 'Tether USD')
export const UST = new Token(ChainId.BSCTESTNET, '0x23396cF899Ca06c4472205fC903bDB4de249D6fC', 18, 'UST', 'Wrapped UST Token')
export const ETH = new Token(ChainId.BSCTESTNET, '0x2170Ed0880ac9A755fd29B2688956BD959F933F8', 18, 'ETH', 'Binance-Peg Ethereum Token')

const WETH_ONLY: ChainTokenList = {
  [ChainId.MAINNET]: [WETH[ChainId.MAINNET]],
  [ChainId.BSCTESTNET]: [WETH[ChainId.BSCTESTNET]],
}

// used to construct intermediary pairs for trading
export const BASES_TO_CHECK_TRADES_AGAINST: ChainTokenList = {
  ...WETH_ONLY,
  [ChainId.BSCTESTNET]: [...WETH_ONLY[ChainId.BSCTESTNET], DAI, BUSD, BTCB, USDT, UST, ETH],
}

/**
 * Some tokens can only be swapped via certain pairs, so we override the list of bases that are considered for these
 * tokens.
 */
export const CUSTOM_BASES: { [chainId in ChainId]?: { [tokenAddress: string]: Token[] } } = {
  [ChainId.BSCTESTNET]: {},
}

// used for display in the default list when adding liquidity
export const SUGGESTED_BASES: ChainTokenList = {
  ...WETH_ONLY,
  [ChainId.BSCTESTNET]: [...WETH_ONLY[ChainId.BSCTESTNET], DAI, BUSD, USDT],
}

// used to construct the list of all pairs we consider by default in the frontend
export const BASES_TO_TRACK_LIQUIDITY_FOR: ChainTokenList = {
  ...WETH_ONLY,
  [ChainId.BSCTESTNET]: [...WETH_ONLY[ChainId.BSCTESTNET], DAI, BUSD, BTCB, USDT],
}

export const PINNED_PAIRS: { readonly [chainId in ChainId]?: [Token, Token][] } = {
  [ChainId.BSCTESTNET]: [
    [CAKE, WBNB],
    [BUSD, USDT],
    [DAI, USDT],
  ],
}

export const NetworkContextName = 'NETWORK'

// default allowed slippage, in bips
export const INITIAL_ALLOWED_SLIPPAGE = 80
// 20 minutes, denominated in seconds
export const DEFAULT_DEADLINE_FROM_NOW = 60 * 20

// one basis point
export const ONE_BIPS = new Percent(JSBI.BigInt(1), JSBI.BigInt(10000))
export const BIPS_BASE = JSBI.BigInt(10000)
// used for warning states
export const ALLOWED_PRICE_IMPACT_LOW: Percent = new Percent(JSBI.BigInt(500), BIPS_BASE) // 5%
export const ALLOWED_PRICE_IMPACT_MEDIUM: Percent = new Percent(JSBI.BigInt(1500), BIPS_BASE) // 15%
export const ALLOWED_PRICE_IMPACT_HIGH: Percent = new Percent(JSBI.BigInt(2500), BIPS_BASE) // 25%
// if the price slippage exceeds this number, force the user to type 'confirm' to execute
export const PRICE_IMPACT_WITHOUT_FEE_CONFIRM_MIN: Percent = new Percent(JSBI.BigInt(10001), BIPS_BASE) // >100%
// for non expert mode disable swaps above this
export const BLOCKED_PRICE_IMPACT_NON_EXPERT: Percent = new Percent(JSBI.BigInt(10001), BIPS_BASE) // >100%

// used to ensure the user doesn't send so much ETH so they end up with <.01
export const MIN_ETH: JSBI = JSBI.exponentiate(JSBI.BigInt(10), JSBI.BigInt(16)) // .01 ETH
