// @ts-nocheck - only temporary
import { BigNumber } from '@ethersproject/bignumber'
import { Contract } from '@ethersproject/contracts'
import { JSBI, Percent, Router, DeployParameters, Trade, TradeType } from '../custom_modules/@filterswap-libs/sdk'
import { useMemo } from 'react'
import { BIPS_BASE, DEFAULT_DEADLINE_FROM_NOW, INITIAL_ALLOWED_SLIPPAGE } from '../constants'
import { useTransactionAdder } from '../state/transactions/hooks'
import { calculateGasMargin, getContract, getDeployerAddress, getManagerContract, getRouterContract, getTokenContract, isAddress, shortenAddress } from '../utils'
import isZero from '../utils/isZero'
import { useActiveWeb3React } from './index'
import useENS from './useENS'

 enum DeployCallbackState {
  INVALID,
  LOADING,
  VALID,
}

interface DeployCall {
  contract: Contract
  parameters: DeployParameters
}

interface SuccessfulCall {
  call: DeployCall
  gasEstimate: BigNumber
}

interface FailedCall {
  call: DeployCall
  error: Error
}

type EstimatedDeployCall = SuccessfulCall | FailedCall

/**
 * Returns the deploy calls that can be used to make the trade
 * @param trade trade to execute
 * @param allowedSlippage user allowed slippage
 * @param deadline the deadline for the trade
 * @param recipientAddressOrName
 */
function useDeployCallArguments(
  params: object | undefined, // trade to execute, required
  allowedSlippage: number = INITIAL_ALLOWED_SLIPPAGE, // in bips
  deadline: number = DEFAULT_DEADLINE_FROM_NOW, // in seconds from now
  recipientAddressOrName: string | null // the ENS name or address of the recipient of the trade, or null if deploy should be returned to sender
): DeployCall[] {
  const { account, chainId, library } = useActiveWeb3React()

  const { address: recipientAddress } = useENS(recipientAddressOrName)
  const recipient = recipientAddressOrName === null ? account : recipientAddress

  return useMemo(() => {
    console.log({params})
    if (!params || !recipient || !library || !account || !chainId) return []

    const contract: Contract | null = getManagerContract(chainId, library, account)
		console.log({contract})
    if (!contract) {
      console.log("Found no contract")
      return []
    }
    const deployMethods = []

    deployMethods.push(
      Router.deployCallParameters(params, {
      })
    )
    
    // if (trade.tradeType === TradeType.EXACT_INPUT) {
    //   deployMethods.push(
    //     // @ts-ignore
    //     Router.deployCallParameters(trade, {
    //       feeOnTransfer: true,
    //       allowedSlippage: new Percent(JSBI.BigInt(Math.floor(allowedSlippage)), BIPS_BASE),
    //       recipient,
    //       ttl: deadline,
    //     })
    //   )
    // }

    return deployMethods.map((parameters) => ({ parameters, contract }))
  }, [account, allowedSlippage, chainId, deadline, library, recipient, params])
}

// returns a function that will execute a swap, if the parameters are all valid
// and the user has approved the slippage adjusted input amount for the trade
export function useDeployCallback(
  params: object | undefined, // trade to execute, required
  allowedSlippage: number = INITIAL_ALLOWED_SLIPPAGE, // in bips
  deadline: number = DEFAULT_DEADLINE_FROM_NOW, // in seconds from now
  recipientAddressOrName: string | null // the ENS name or address of the recipient of the trade, or null if deploy should be returned to sender
): { state: DeployCallbackState; callback: null | (() => Promise<string>); error: string | null } {
  const { account, chainId, library } = useActiveWeb3React()
	
  const deployCalls = useDeployCallArguments(params, allowedSlippage, deadline, recipientAddressOrName)
  // const managerContract = getManagerContract(chainId, library, account)
  // const deployerContract = getDeployerContract(chainId, library, account)
  // const tokenContract = getTokenContract(chainId, library, account)

  // const wethAddress = getWethAddress()

  

  const addTransaction = useTransactionAdder()

  const { address: recipientAddress } = useENS(recipientAddressOrName)
  const recipient = recipientAddressOrName === null ? account : recipientAddress

  return useMemo(() => {
    console.log({params})
    if (!params || !library || !account || !chainId) {
      return { state: DeployCallbackState.INVALID, callback: null, error: 'Missing dependencies' }
    }
    if (!recipient) {
      if (recipientAddressOrName !== null) {
        return { state: DeployCallbackState.INVALID, callback: null, error: 'Invalid recipient' }
      }
      return { state: DeployCallbackState.LOADING, callback: null, error: null }
    }

    return {
      state: DeployCallbackState.VALID,
      callback: async function onDeploy(): Promise<string> {
        const estimatedCalls: EstimatedDeployCall[] = await Promise.all(
          deployCalls.map((call) => {
            const {
              parameters: { methodName, args, value },
              contract,
            } = call
            const options = !value || isZero(value) ? {} : { value }

            console.log(methodName)
            console.log(contract)
            
            return contract.estimateGas[methodName](...args, options)
            .then((gasEstimate) => {
              console.log(call)
              console.log(gasEstimate)
              return {
                  call,
                  gasEstimate,
                }
              })
              .catch((gasError) => {
                console.info('Gas estimate failed, trying eth_call to extract error', call)

                return contract.callStatic[methodName](...args, options)
                  .then((result) => {
                    console.info('Unexpected successful call after failed estimate gas', call, gasError, result)
                    return { call, error: new Error('Unexpected issue with estimating the gas. Please try again.') }
                  })
                  .catch((callError) => {
                    console.info('Call threw error', call, callError)
                    let errorMessage: string
                    switch (callError.reason) {
                      case 'UniswapV2Router: INSUFFICIENT_OUTPUT_AMOUNT':
                      case 'UniswapV2Router: EXCESSIVE_INPUT_AMOUNT':
                        errorMessage =
                          'This transaction will not succeed either due to price movement or fee on transfer. Try increasing your slippage tolerance.'
                        break
                      default:
                        errorMessage = `The transaction cannot succeed due to error: ${callError.reason}. This is probably an issue with one of the tokens you are swapping.`
                    }
                    return { call, error: new Error(errorMessage) }
                  })
              })
          })
        )

        // a successful estimation is a bignumber gas estimate and the next call is also a bignumber gas estimate
        const successfulEstimation = estimatedCalls.find(
          (el, ix, list): el is SuccessfulCall =>
            'gasEstimate' in el && (ix === list.length - 1 || 'gasEstimate' in list[ix + 1])
        )

        if (!successfulEstimation) {
          const errorCalls = estimatedCalls.filter((call): call is FailedCall => 'error' in call)
          if (errorCalls.length > 0) throw errorCalls[errorCalls.length - 1].error
          throw new Error('Unexpected error. Please contact support: none of the calls threw an error')
        }

        const {
          call: {
            contract,
            parameters: { methodName, args, value },
          },
          gasEstimate,
        } = successfulEstimation

        return contract[methodName](...args, {
          gasLimit: calculateGasMargin(gasEstimate),
          ...(value && !isZero(value) ? { value, from: account } : { from: account }),
        })
          .then((response: any) => {
            console.log("We runnin'")
            console.log({response})
            const inputSymbol = "Hi" // trade.inputAmount.currency.symbol
            const outputSymbol = "Hi" // trade.outputAmount.currency.symbol
            const inputAmount = 1.1 // trade.inputAmount.toSignificant(3)
            const outputAmount = 1.11 // trade.outputAmount.toSignificant(3)

            // const base = `Swap ${inputAmount} ${inputSymbol} for ${outputAmount} ${outputSymbol}`
						const base = `Create and Deploy Token`
            // const withRecipient =
            //   recipient === account
            //     ? base
            //     : `${base} to ${
            //         recipientAddressOrName && isAddress(recipientAddressOrName)
            //           ? shortenAddress(recipientAddressOrName)
            //           : recipientAddressOrName
            //       }`

            addTransaction(response, {
              summary: base,
            })

            return response
          })
          .catch((error: any) => {
            // if the user rejected the tx, pass this along
            if (error?.code === 4001) {
              throw new Error('Transaction rejected.')
            } else {
              // otherwise, the error was unexpected and we need to convey that
              console.error(`Deploy failed`, error, methodName, args, value)
              throw new Error(`Deploy failed: ${error.message}`)
            }
          })
      },
      error: null,
    }
  }, [params, library, account, chainId, recipient, recipientAddressOrName, deployCalls, addTransaction])
}

export default useDeployCallback