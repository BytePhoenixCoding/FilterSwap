// @ts-nocheck - only temporary
import { BigNumber } from '@ethersproject/bignumber'
import { Contract } from '@ethersproject/contracts'
import { JSBI, Percent, Router, DeployParameters, Trade, TradeType } from '../custom_modules/@filterswap-libs/sdk'
import { useMemo } from 'react'
import { BIPS_BASE, DEFAULT_DEADLINE_FROM_NOW, INITIAL_ALLOWED_SLIPPAGE } from '../constants'
import { useTransactionAdder } from '../state/transactions/hooks'
import { calculateGasMargin, getDeployerContract } from '../utils'
import isZero from '../utils/isZero'
import { useActiveWeb3React } from './index'
import useENS from './useENS'
import { Currency } from '@pancakeswap-libs/sdk'
import {  useDeployState } from 'state/deploy/hooks'

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
 * Returns the deploy calls that can be used
 * @param newTokenParams the token to create
 * @param inputCurrency base token Currency
 * @param inputAmount base token amount
 * @param selectedTemplate template of createToken to use
 * @param deadline the deadline for the trade
 */
function useDeployCallArguments(
  newTokenParams: object | undefined,
  inputCurrency: Currency | undefined,
  inputAmount: string | undefined,
  selectedTemplate: number,
  deadline: number = DEFAULT_DEADLINE_FROM_NOW, // in seconds from now
): DeployCall[] {
  const { account, chainId, library } = useActiveWeb3React()
  const { ownerShare, daysToLock, lockForever } = useDeployState()
  return useMemo(() => {
    if (!newTokenParams || !library || !account || !chainId) return []

    const contract: Contract | null = getDeployerContract(chainId, library, account)
    if (!contract) {
      console.log("Found no contract")
      return []
    }
    const deployMethods = []

    deployMethods.push(
      Router.deployCallParameters(newTokenParams, {
        ownerShare,
        daysToLock,
        lockForever,
        deadline,
        inputAmount,
        inputCurrency,
        selectedTemplate,
        deadline
      })
    )


    return deployMethods.map((parameters) => ({ parameters, contract }))
  }, [account, chainId, deadline, library, newTokenParams, ownerShare, daysToLock, lockForever, inputCurrency, inputAmount])
}

// returns a function that will execute a token deploy
export function useDeployCallback(
  newTokenParams: object,
  inputCurrency: Currency | undefined,
  inputAmount: string | undefined,
  selectedTemplate: number,
  deadline: number = DEFAULT_DEADLINE_FROM_NOW, // in seconds from now
): { state: DeployCallbackState; callback: null | (() => Promise<string>); error: string | null } {

  const { account, chainId, library } = useActiveWeb3React()
  const { ownerShare, daysToLock, lockForever } = useDeployState()
  const deployCalls = useDeployCallArguments(newTokenParams, inputCurrency, inputAmount, selectedTemplate, deadline)
  const addTransaction = useTransactionAdder()

  return useMemo(() => {
    if (!newTokenParams || !library || !account || !chainId) {
      return { state: DeployCallbackState.INVALID, callback: null, error: 'Missing dependencies' }
    }
    if (inputAmount <= 0) {
      return { state: DeployCallbackState.INVALID, callback: null, error: 'Initial Liquidity must be above 0' }
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

            return contract.estimateGas[methodName](...args, options)
            .then((gasEstimate) => {
              console.log(call)
              console.log(gasEstimate.toString())
              return {
                  call,
                  gasEstimate,
                }
              })
              .catch((gasError) => {
                console.info('Gas estimate failed, trying eth_call to extract error', call)
                console.info(gasError)

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
          .then((response) => {
            console.log({response})

						const base = `Created and Deployed ${newTokenParams.tokenName}`

            addTransaction(response, {
              summary: base,
            })
            const hash = response.hash
            return response.wait().then(res => {
              
              console.log(hash, res)
              const address = res.events[0].address
              return {
                hash,
                address
              }})

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
  }, [newTokenParams, ownerShare, inputCurrency, inputAmount, daysToLock, lockForever, library, account, chainId, deployCalls, addTransaction])
}

export default useDeployCallback