import { Currency, CurrencyAmount, ETHER, JSBI, Token, TokenAmount, Percent } from '../../custom_modules/@filterswap-libs/sdk'
import { useMemo } from 'react'
import ERC20_INTERFACE from '../../constants/abis/erc20'
import { useAllTokens } from '../../hooks/Tokens'
import { useActiveWeb3React } from '../../hooks'
import { useMulticallContract, useManagerContract } from '../../hooks/useContract'
import { isAddress } from '../../utils'
import { useSingleContractMultipleData, useMultipleContractSingleData, useSingleCallResult } from '../multicall/hooks'
import { DEPLOYER_MINT_FEE } from '../../constants'
import { tryParseAmount } from 'state/swap/hooks'

/**
 * Returns a map of the given addresses to their eventually consistent ETH balances.
 */
export function useETHBalances(
  uncheckedAddresses?: (string | undefined)[]
): { [address: string]: CurrencyAmount | undefined } {
  const multicallContract = useMulticallContract()

  const addresses: string[] = useMemo(
    () =>
      uncheckedAddresses
        ? uncheckedAddresses
            .map(isAddress)
            .filter((a): a is string => a !== false)
            .sort()
        : [],
    [uncheckedAddresses]
  )

  const results = useSingleContractMultipleData(
    multicallContract,
    'getEthBalance',
    addresses.map(address => [address])
  )

  return useMemo(
    () =>
      addresses.reduce<{ [address: string]: CurrencyAmount }>((memo, address, i) => {
        const value = results?.[i]?.result?.[0]
        if (value) memo[address] = CurrencyAmount.ether(JSBI.BigInt(value.toString()))
        return memo
      }, {}),
    [addresses, results]
  )
}

/**
 * Returns a map of token addresses to their eventually consistent token balances for a single account.
 */
export function useTokenBalancesWithLoadingIndicator(
  address?: string,
  tokens?: (Token | undefined)[]
): [{ [tokenAddress: string]: TokenAmount | undefined }, boolean] {
  const validatedTokens: Token[] = useMemo(
    () => tokens?.filter((t?: Token): t is Token => isAddress(t?.address) !== false) ?? [],
    [tokens]
  )

  const validatedTokenAddresses = useMemo(() => validatedTokens.map(vt => vt.address), [validatedTokens])

  const balances = useMultipleContractSingleData(validatedTokenAddresses, ERC20_INTERFACE, 'balanceOf', [address])

  const anyLoading: boolean = useMemo(() => balances.some(callState => callState.loading), [balances])

  return [
    useMemo(
      () =>
        address && validatedTokens.length > 0
          ? validatedTokens.reduce<{ [tokenAddress: string]: TokenAmount | undefined }>((memo, token, i) => {
              const value = balances?.[i]?.result?.[0]
              const amount = value ? JSBI.BigInt(value.toString()) : undefined
              if (amount) {
                memo[token.address] = new TokenAmount(token, amount)
              }
              return memo
            }, {})
          : {},
      [address, validatedTokens, balances]
    ),
    anyLoading
  ]
}

export function useTokenBalances(
  address?: string,
  tokens?: (Token | undefined)[]
): { [tokenAddress: string]: TokenAmount | undefined } {
  return useTokenBalancesWithLoadingIndicator(address, tokens)[0]
}

// get the balance for a single token/account combo
export function useTokenBalance(account?: string, token?: Token): TokenAmount | undefined {
  const tokenBalances = useTokenBalances(account, [token])
  if (!token) return undefined
  return tokenBalances[token.address]
}

export function useCurrencyBalances(
  account?: string,
  currencies?: (Currency | undefined)[]
): (CurrencyAmount | undefined)[] {
  const tokens = useMemo(() => currencies?.filter((currency): currency is Token => currency instanceof Token) ?? [], [
    currencies
  ])

  const tokenBalances = useTokenBalances(account, tokens)
  const containsETH: boolean = useMemo(() => currencies?.some(currency => currency === ETHER) ?? false, [currencies])
  const ethBalance = useETHBalances(containsETH ? [account] : [])

  return useMemo(
    () =>
      currencies?.map(currency => {
        if (!account || !currency) return undefined
        if (currency instanceof Token) return tokenBalances[currency.address]
        if (currency === ETHER) return ethBalance[account]
        return undefined
      }) ?? [],
    [account, currencies, ethBalance, tokenBalances]
  )
}
export function useMintFee(
  parsedAmount
): CurrencyAmount | undefined {
  
  if(!parsedAmount) return undefined
  
  // const managerContract = useManagerContract()
  // const tokenMintFee = useSingleCallResult(managerContract, 'tokenMintFee')?.result?.[0]

  const feePercent: Percent = new Percent(DEPLOYER_MINT_FEE.toString(), "10000")
  const feeAmount = new TokenAmount(parsedAmount.currency, feePercent.multiply(parsedAmount.raw).quotient )
  return tryParseAmount(feeAmount.toFixed(18), parsedAmount.currency)
}

export function useCurrencyBalance(account?: string, currency?: Currency): CurrencyAmount | undefined {
  return useCurrencyBalances(account, [currency])[0]
}

// mimics useAllBalances
export function useAllTokenBalances(): { [tokenAddress: string]: TokenAmount | undefined } {
  const { account } = useActiveWeb3React()
  const allTokens = useAllTokens()
  const allTokensArray = useMemo(() => Object.values(allTokens ?? {}), [allTokens])
  const balances = useTokenBalances(account ?? undefined, allTokensArray)
  return balances ?? {}
}

export function useLiquidityUnlockTime(pairToken: Token) {
  const { account } = useActiveWeb3React()
  const managerContract = useManagerContract()
  const isLocked = useSingleCallResult(
    managerContract || undefined,
    "isLiquidityLocked",
    [account || "0x0", pairToken.address]
  )
  if(!managerContract) return ""

  let unlockTime = new Date(0)

  const inputs: any = useMemo(() => [account, pairToken.address], [pairToken, account])
  const utcTime = useSingleCallResult(
    managerContract,
    'liquidityUnlockTimes',
    inputs
    )
  unlockTime.setUTCSeconds(utcTime.result?.[0].toString())
  return utcTime.loading ? "..." : isNaN(unlockTime.getTime()) ? "Forever" : unlockTime
}

export function useIsLiquidityLocked(pairToken: Token): any {
  const { account } = useActiveWeb3React()
  const managerContract = useManagerContract()
  const isLocked = useSingleCallResult(
    managerContract || undefined,
    "isLiquidityLocked",
    [account || "0x0", pairToken.address]
  )
  if(!managerContract) return true
  return isLocked.loading ? undefined : isLocked.result?.[0]
}