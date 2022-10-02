import { ChainId, JSBI, Percent, Token, WETH } from '../custom_modules/@filterswap-libs/sdk'

export const FACTORY_ADDRESS: string = <string>process.env.REACT_APP_FACTORY_ADDRESS
export const ROUTER_ADDRESS: string = <string>process.env.REACT_APP_ROUTER_ADDRESS
export const INIT_CODE_HASH: string = <string>process.env.REACT_APP_INIT_CODE_HASH

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
export const ALLOWED_PRICE_IMPACT_LOW: Percent = new Percent(JSBI.BigInt(100), BIPS_BASE) // 1%
export const ALLOWED_PRICE_IMPACT_MEDIUM: Percent = new Percent(JSBI.BigInt(300), BIPS_BASE) // 3%
export const ALLOWED_PRICE_IMPACT_HIGH: Percent = new Percent(JSBI.BigInt(500), BIPS_BASE) // 5%
// if the price slippage exceeds this number, force the user to type 'confirm' to execute
export const PRICE_IMPACT_WITHOUT_FEE_CONFIRM_MIN: Percent = new Percent(JSBI.BigInt(1000), BIPS_BASE) // 10%
// for non expert mode disable swaps above this
export const BLOCKED_PRICE_IMPACT_NON_EXPERT: Percent = new Percent(JSBI.BigInt(1500), BIPS_BASE) // 15%

// used to ensure the user doesn't send so much ETH so they end up with <.01
export const MIN_ETH: JSBI = JSBI.exponentiate(JSBI.BigInt(10), JSBI.BigInt(16)) // .01 ETH


export const MANAGER_ADDRESS = "0x3a4e3B1142A9cD904280d734b0EC7922198BdD70";

export const MANAGER_ABI = [{"inputs":[],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"","type":"address"},{"indexed":false,"internalType":"uint256","name":"","type":"uint256"}],"name":"requestSubmitted","type":"event"},{"inputs":[{"internalType":"address","name":"_tokenAddress","type":"address"}],"name":"acceptVerificationRequest","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_templateAddress","type":"address"}],"name":"addTokenTemplate","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"adminAddress","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_presaleID","type":"uint256"}],"name":"cancelPresale","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_tokenAddress","type":"address"}],"name":"claimExpiredRequestFee","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_presaleID","type":"uint256"}],"name":"claimRefund","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"confirmInitialization","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"createPresaleFromToken","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_tokenType","type":"uint256"},{"internalType":"string","name":"_tokenName","type":"string"},{"internalType":"string","name":"_tokenSymbol","type":"string"},{"internalType":"bytes32[]","name":"_tokenArgs","type":"bytes32[]"},{"internalType":"uint256[]","name":"_presaleArgs","type":"uint256[]"},{"internalType":"address","name":"_baseTokenAddress","type":"address"},{"internalType":"uint256","name":"_ownerShare","type":"uint256"},{"internalType":"uint256","name":"_liquidityLockTime","type":"uint256"}],"name":"createPresaleWithTemplate","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"deployerAddress","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"factoryAddress","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"feeToAddress","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_presaleID","type":"uint256"}],"name":"finalizePresale","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_userAddress","type":"address"},{"internalType":"address","name":"_tokenAddress","type":"address"}],"name":"getLiquidityUnlockTime","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_userAddress","type":"address"},{"internalType":"address","name":"_pairAddress","type":"address"},{"internalType":"uint256","name":"_liquidityLockTime","type":"uint256"}],"name":"imposeLiquidityLock","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_presaleID","type":"uint256"},{"internalType":"uint256","name":"_buyAmount","type":"uint256"}],"name":"investInPresale","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[],"name":"isInitialized","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_liquidityProviderAddress","type":"address"},{"internalType":"address","name":"_pairAddress","type":"address"}],"name":"isLiquidityLocked","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"isTokenVerified","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"},{"internalType":"address","name":"","type":"address"}],"name":"liquidityUnlockTimes","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_tokenAddress","type":"address"}],"name":"makeVerificationRequest","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[],"name":"managerAddress","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"maxOwnerShare","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"maxPresaleDuration","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"minLiquidityLockTime","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"minPresaleDuration","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"numPresalesCreated","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"numTokenTemplates","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"presaleCreationAllowed","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"presaleFee","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"presaleInfo","outputs":[{"internalType":"address","name":"tokenAddress","type":"address"},{"internalType":"address","name":"baseTokenAddress","type":"address"},{"internalType":"address","name":"presaleCreator","type":"address"},{"internalType":"uint256","name":"ownerShare","type":"uint256"},{"internalType":"uint256","name":"totalFundsRaised","type":"uint256"},{"internalType":"uint256","name":"liquidityLockTime","type":"uint256"},{"internalType":"uint256","name":"presaleStatus","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"presaleMaxFinalizeTime","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_tokenAddress","type":"address"}],"name":"rejectVerificationRequest","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_userAddress","type":"address"},{"internalType":"address","name":"_tokenAddress","type":"address"}],"name":"removeLiquidityLock","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_templateIndex","type":"uint256"}],"name":"removeTokenTemplate","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"routerAddress","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_adminAddress","type":"address"}],"name":"setAdminAddress","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_deployerAddress","type":"address"}],"name":"setDeployerAddress","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_factoryAddress","type":"address"}],"name":"setFactoryAddress","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_feeToAddress","type":"address"}],"name":"setFeeToAddress","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_userAddress","type":"address"},{"internalType":"address","name":"_tokenAddress","type":"address"},{"internalType":"uint256","name":"_liquidityLockTime","type":"uint256"}],"name":"setLiquidityUnlockTime","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_maxOwnerShare","type":"uint256"}],"name":"setMaxOwnerShare","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_minLiquidityLockTime","type":"uint256"}],"name":"setMinLiquidityLockTime","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"bool","name":"_presaleCreationAllowed","type":"bool"}],"name":"setPresaleCreationAllowed","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_presaleFee","type":"uint256"}],"name":"setPresaleFee","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_routerAddress","type":"address"}],"name":"setRouterAddress","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"bool","name":"_tokenCreationAllowed","type":"bool"}],"name":"setTokenCreationAllowed","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_tokenMintFee","type":"uint256"}],"name":"setTokenMintFee","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_tokenAddress","type":"address"}],"name":"setTokenVerified","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_verificationRequestDeadline","type":"uint256"}],"name":"setVerificationRequestDeadline","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_verificationRequestFee","type":"uint256"}],"name":"setVerificationRequestFee","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"bool","name":"_verificationRequestsAllowed","type":"bool"}],"name":"setVerificationRequestsAllowed","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_wethAddress","type":"address"}],"name":"setWethAddress","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"tokenCreationAllowed","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"tokenMintFee","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"tokenTemplateAddresses","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"},{"internalType":"address","name":"","type":"address"}],"name":"userPresaleInvestments","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"verificationRequestDeadline","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"verificationRequestDeadlines","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"verificationRequestFee","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"verificationRequestMaker","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"verificationRequestStatuses","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"verificationRequestsAllowed","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"wethAddress","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"stateMutability":"payable","type":"receive"}];
export const DEPLOYER_ABI = [{"inputs":[{"internalType":"address","name":"_managerAddress","type":"address"}],"stateMutability":"nonpayable","type":"constructor"},{"inputs":[{"internalType":"uint256","name":"_tokenType","type":"uint256"},{"internalType":"string","name":"_tokenName","type":"string"},{"internalType":"string","name":"_tokenSymbol","type":"string"},{"internalType":"bytes32[]","name":"_tokenArgs","type":"bytes32[]"},{"internalType":"address","name":"_ownerAddress","type":"address"}],"name":"createPresaleToken","outputs":[{"internalType":"address","name":"deployedTokenAddress","type":"address"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_tokenType","type":"uint256"},{"internalType":"string","name":"_tokenName","type":"string"},{"internalType":"string","name":"_tokenSymbol","type":"string"},{"internalType":"bytes32[]","name":"_tokenArgs","type":"bytes32[]"},{"internalType":"address","name":"_baseTokenAddress","type":"address"},{"internalType":"uint256","name":"_baseTokenAmount","type":"uint256"},{"internalType":"uint256","name":"_ownerShare","type":"uint256"},{"internalType":"uint256","name":"_liquidityLockTime","type":"uint256"}],"name":"createToken","outputs":[{"internalType":"address","name":"deployedTokenAddress","type":"address"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_tokenType","type":"uint256"},{"internalType":"string","name":"_tokenName","type":"string"},{"internalType":"string","name":"_tokenSymbol","type":"string"},{"internalType":"bytes32[]","name":"_tokenArgs","type":"bytes32[]"},{"internalType":"uint256","name":"_ownerShare","type":"uint256"},{"internalType":"uint256","name":"_liquidityLockTime","type":"uint256"}],"name":"createTokenETH","outputs":[{"internalType":"address","name":"deployedTokenAddress","type":"address"}],"stateMutability":"payable","type":"function"}];
export const ERC20_ABI = [{"constant":true,"inputs":[],"name":"name","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_spender","type":"address"},{"name":"_value","type":"uint256"}],"name":"approve","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"totalSupply","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_from","type":"address"},{"name":"_to","type":"address"},{"name":"_value","type":"uint256"}],"name":"transferFrom","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"decimals","outputs":[{"name":"","type":"uint8"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"_owner","type":"address"}],"name":"balanceOf","outputs":[{"name":"balance","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"symbol","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_to","type":"address"},{"name":"_value","type":"uint256"}],"name":"transfer","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"_owner","type":"address"},{"name":"_spender","type":"address"}],"name":"allowance","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"payable":true,"stateMutability":"payable","type":"fallback"},{"anonymous":false,"inputs":[{"indexed":true,"name":"owner","type":"address"},{"indexed":true,"name":"spender","type":"address"},{"indexed":false,"name":"value","type":"uint256"}],"name":"Approval","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"from","type":"address"},{"indexed":true,"name":"to","type":"address"},{"indexed":false,"name":"value","type":"uint256"}],"name":"Transfer","type":"event"}];