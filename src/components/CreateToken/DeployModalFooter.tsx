import { useState } from 'react'
import { Text, Button } from '../../custom_modules/@filterswap-libs/uikit'
import { Token, Currency, Price } from '../../custom_modules/@filterswap-libs/sdk'
import { Repeat } from 'react-feather'
import { AutoColumn } from '../Column'
import QuestionHelper from '../QuestionHelper'
import { AutoRow, RowBetween, RowFixed } from '../Row'
import { DeployCallbackError, StyledBalanceMaxMini } from './styleds'
import { useDeployState, useDerivedDeployInfo } from '../../state/deploy/hooks'
import { tryParseAmount } from 'state/swap/hooks'
import { CHAIN_ID, DEPLOYER_ADDRESS } from '../../constants'
export default function DeployModalFooter({
  onConfirm,
  deployErrorMessage,
  disabledConfirm,
}: {
  onConfirm: () => void
  deployErrorMessage: string | undefined
  disabledConfirm: boolean
}) {
  const { ownerShare, liquidityShare, params, createOptions, daysToLock, lockForever, typedValue } = useDeployState()
  const { calculatedMintFee, parsedAmount } = useDerivedDeployInfo()
  const outputCurrency = new Token(CHAIN_ID, DEPLOYER_ADDRESS, 18, 'ASD', 'ASDer', false) // { decimals: 18, symbol: 'ASD', name: 'ASDer' }
  const outputAmount = tryParseAmount(params.totalSupply.toString(), outputCurrency)

  const [showInverted, setShowInverted] = useState<boolean>(false)
  const ownerShareAmt = Math.round((ownerShare / params.totalSupply) * 10000) / 10000
  const initLqAmount =
    !!calculatedMintFee && !!parsedAmount ? parsedAmount.subtract(calculatedMintFee).toSignificant(5) : 0

  const formatExecutionPrice = (inputAmount, outputAmount, inverted?: boolean): string => {
    if (!inputAmount || !outputAmount) {
      return ''
    }
    const executionPrice = new Price(inputAmount.currency, outputAmount.currency, inputAmount.raw, outputAmount.raw)

    return inverted
      ? `${executionPrice.invert().toSignificant(6)} ${inputAmount.currency.symbol} / ${outputAmount.currency.symbol}`
      : `${executionPrice.toSignificant(6)} ${outputAmount.currency.symbol} / ${inputAmount.currency.symbol}`
  }
  return (
    <>
      <AutoColumn gap="0px">
        <RowBetween>
          <Text fontSize="14px">Initial Liquidity Amount</Text>
          {/* <QuestionHelper text={'To Change'} /> */}
          <Text fontSize="14px">
            {initLqAmount} {parsedAmount?.currency.symbol}
          </Text>
        </RowBetween>
        <RowBetween>
          <Text fontSize="14px">Token Mint Fee</Text>
          {/* <QuestionHelper text={'To Change'} /> */}
          <Text fontSize="14px">
            {calculatedMintFee?.toSignificant(5)} {parsedAmount?.currency.symbol}
          </Text>
        </RowBetween>
        <RowBetween>
          <Text fontSize="14px">Liquidity Lock Time</Text>
          {/* <QuestionHelper text={'To Change'} /> */}
          <Text fontSize="14px">{lockForever ? 'Forever' : `${daysToLock} Days`}</Text>
        </RowBetween>
        <RowBetween>
          <Text fontSize="14px">You will receive </Text>
          {/* <QuestionHelper text={'To Change'} /> */}
          <Text fontSize="14px">{`${ownerShareAmt} ${params.tokenSymbol} (${ownerShare}%)`}</Text>
        </RowBetween>
        <RowBetween align="center">
          <Text fontSize="14px">Price</Text>
          <Text
            fontSize="14px"
            style={{
              justifyContent: 'center',
              alignItems: 'center',
              display: 'flex',
              textAlign: 'right',
              paddingLeft: '8px',
              fontWeight: 500,
            }}
          >
            {formatExecutionPrice(parsedAmount, outputAmount, showInverted)}
            <StyledBalanceMaxMini onClick={() => setShowInverted(!showInverted)}>
              <Repeat size={14} />
            </StyledBalanceMaxMini>
          </Text>
        </RowBetween>
      </AutoColumn>

      <AutoRow>
        <Button onClick={onConfirm} disabled={disabledConfirm} mt="10px" id="confirm-swap-or-send" width="100%">
          Deploy Token
        </Button>

        {deployErrorMessage ? <DeployCallbackError error={deployErrorMessage} /> : null}
      </AutoRow>
    </>
  )
}
