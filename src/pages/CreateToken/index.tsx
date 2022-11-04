import { useCallback, useEffect, useContext, useState } from 'react'
import styled, { ThemeContext } from 'styled-components'
import {
  DEPLOYER_MAX_OWNER_SHARE,
  LIQUIDITY_MIN_LOCK_TIME,
  LIQUIDITY_RECOMMENDED_LOCK_TIME,
  CHAIN_ID,
} from '../../constants'

import AppBody from '../AppBody'
import { Box, Button, Toggle, CardBody, Text, Heading, Input } from '../../custom_modules/@filterswap-libs/uikit'
import { Token } from '../../custom_modules/@filterswap-libs/sdk'

import CardNav from 'components/CardNav'
import { AutoRow, RowBetween } from 'components/Row'
import { AutoColumn } from 'components/Column'
import CurrencyInputPanel from 'components/CurrencyInputPanel'
import ConfirmDeployModal from 'components/CreateToken/ConfirmDeployModal'

import useI18n from 'hooks/useI18n'
import { useDeployCallback } from 'hooks/useDeployCallback'
import { ApprovalState, useApproveCallbackForDeploy } from 'hooks/useApproveCallback'

import { Field } from 'state/swap/actions'
import { BottomGrouping } from 'components/swap/styleds'
import {
  useDerivedDeployInfo,
  useDeployActionHandlers,
  useDeployState,
  useOwnerShare,
  useDaysToLock,
  useParams,
  useNewTokenAddress,
  useTemplates,
} from 'state/deploy/hooks'

import { useActiveWeb3React } from 'hooks'
import PageHeader from 'components/PageHeader'
import Loader from 'components/Loader'
import ConnectWalletButton from 'components/ConnectWalletButton'
import ProgressSteps from 'components/ProgressSteps'
import { deployTokenTemplates } from '../../constants/deployToken/templates'

import { PairState, usePairCurAddress } from 'data/Reserves'
import { useUserDeadline, usePairAdder, useAddUserToken } from 'state/user/hooks'

export const FixedHeightRow = styled(RowBetween)`
  height: 24px;
`

export const Select = styled('select')`
  width: 100%;
  height: 24px;
  // -webkit-appearance: none;
  // -moz-appearance: none;
  // appearance: none;
  background-image: ;
  color: #eae2fc;
  background-color: #483f5a;
  border: 0;
  border-radius: 16px;
  box-shadow: inset 0px 2px 2px -1px rgb(74 74 104 / 10%);
  display: block;
  font-size: 16px;
  padding: 0 16px;
  height: 40px;
`

export default function CreateToken() {
  const theme = useContext(ThemeContext)
  const TranslateString = useI18n()

  const { handleParamsChange } = useParams()
  const { handleDaysToLockChange, handleLockForever } = useDaysToLock()
  const { handleOwnerShareChange, handleLiquidityShareChange } = useOwnerShare()
  const { handleTemplateChange } = useTemplates()
  const { handleNewTokenAddress } = useNewTokenAddress()

  const { onCurrencySelection, onUserInput } = useDeployActionHandlers()

  const { parsedAmount, currencies, inputError: deployInputError } = useDerivedDeployInfo()
  const {
    independentField,
    typedValue,

    ownerShare,
    liquidityShare,

    daysToLock,
    lockForever,
    params,

    selectedTemplate,
    createOptions,
    newTokenAddress,
  } = useDeployState()

  const handleTypeInput = useCallback(
    (value: string) => {
      onUserInput(Field.INPUT, value)
    },
    [onUserInput]
  )

  const [deadline] = useUserDeadline()

  const parsedAmounts = {
    [Field.INPUT]: parsedAmount,
  }

  // check whether the user has approved the router on the input token
  const [approval, approveCallback] = useApproveCallbackForDeploy(parsedAmounts[Field.INPUT])

  // mark when a user has submitted an approval, reset onTokenSelection for input field
  const [approvalSubmitted, setApprovalSubmitted] = useState<boolean>(false)
  useEffect(() => {
    if (approval === ApprovalState.PENDING) {
      setApprovalSubmitted(true)
    }
  }, [approval, approvalSubmitted])

  // modal and loading
  const [{ showConfirm, paramsToConfirm, deployErrorMessage, attemptingTxn, txHash }, setDeployState] = useState<{
    showConfirm: boolean
    paramsToConfirm: object | undefined
    attemptingTxn: boolean
    deployErrorMessage: string | undefined
    txHash: string | undefined
  }>({
    showConfirm: false,
    paramsToConfirm: undefined,
    attemptingTxn: false,
    deployErrorMessage: undefined,
    txHash: undefined,
  })

  const [pairState, pair] = usePairCurAddress(currencies[Field.INPUT] ?? undefined, newTokenAddress)
  const addPair = usePairAdder()
  const addToken = useAddUserToken()

  // Add lq pair when it exists
  useEffect(() => {
    if (pairState == PairState.EXISTS && pair) {
      addPair(pair)
    }
  }, [pairState])

  // the callback to execute the create
  const { callback: deployCallback, error: deployCallbackError } = useDeployCallback(
    params,
    currencies[Field.INPUT],
    typedValue,
    selectedTemplate,
    deadline
  )
  const handleDeploy = useCallback(() => {
    if (!deployCallback) {
      return
    }
    setDeployState((prevState) => ({
      ...prevState,
      attemptingTxn: true,
      deployErrorMessage: undefined,
      txHash: undefined,
    }))
    deployCallback()
      .then((response: any) => {
        const newToken = new Token(CHAIN_ID, response.address, 18, params.tokenSymbol, params.tokenName, false)
        addToken(newToken)
        handleNewTokenAddress(response.address)
        setDeployState((prevState) => ({
          ...prevState,
          attemptingTxn: false,
          deployErrorMessage: undefined,
          txHash: response.hash,
        }))
      })
      .catch((error) => {
        console.log('error')
        console.log(error)
        setDeployState((prevState) => ({
          ...prevState,
          attemptingTxn: false,
          deployErrorMessage: error.message,
          txHash: undefined,
        }))
      })
  }, [setDeployState, deployCallback])

  const formattedAmounts = {
    [independentField]: typedValue,
  }

  const handleInputSelect = useCallback(
    (inputCurrency) => {
      setApprovalSubmitted(false) // reset 2 step UI for approvals
      onCurrencySelection(Field.INPUT, inputCurrency)
    },
    [onCurrencySelection, setApprovalSubmitted, () => {}]
  )

  const showApproveFlow =
    !deployInputError &&
    (approval === ApprovalState.NOT_APPROVED ||
      approval === ApprovalState.PENDING ||
      (approvalSubmitted && approval === ApprovalState.APPROVED))

  const handleConfirmDismiss = useCallback(() => {
    setDeployState((prevState) => ({ ...prevState, newTokenAddress: undefined, showConfirm: false }))
    // if there was a tx hash, we want to clear the input and new token address
    if (txHash) {
      onUserInput(Field.INPUT, '')
      handleNewTokenAddress('0x0')
    }
  }, [onUserInput, txHash, setDeployState])
  const { account } = useActiveWeb3React()

  const handleAcceptChanges = useCallback(() => {
    setDeployState((prevState) => ({ ...prevState, params }))
  }, [params])

  return (
    <>
      <CardNav activeIndex={2} />
      <AppBody>
        <PageHeader
          title={'Create Token'}
          description={
            'To create a token on FilterSwap, deploy a token contract then add liquidity to make it tradeable.'
          }
        />
        <AutoColumn gap="lg" justify="center">
          <ConfirmDeployModal
            isOpen={showConfirm}
            onAcceptChanges={handleAcceptChanges}
            attemptingTxn={attemptingTxn}
            txHash={txHash}
            onConfirm={handleDeploy}
            deployErrorMessage={deployErrorMessage}
            onDismiss={handleConfirmDismiss}
          />
          <CardBody>
            <Text color={theme.colors.text}>{TranslateString(107, 'Step 1')}</Text>
            <Text color="textSubtle" fontSize="17px">
              {TranslateString(107, 'Choose a token template below.')}
            </Text>
            <br />
            <div style={{ display: 'flex', gap: '5%', justifyContent: 'center' }}>
              <Select onChange={handleTemplateChange}>
                {deployTokenTemplates.map((e, i) => (
                  <option key={i} value={i}>
                    {e.name}
                  </option>
                ))}
              </Select>
            </div>
            <br />
            <Text color="textSubtle" fontSize="14px">
              {createOptions.description}
            </Text>
            <br />
            <fieldset>
              <legend style={{ margin: '2%', padding: '1%' }}>Token Details</legend>
              {(createOptions.options || deployTokenTemplates[0].options).map((e, i) => {
                var inside
                if (e.type == 'number' || e.type == 'percent') {
                  inside = (
                    <Input
                      id={e.id}
                      type="number"
                      scale="lg"
                      step={e.type == 'percent' ? 0.25 : 1}
                      min={e.min || 0}
                      max={e.max || 1000000000000000}
                      value={params[e.id]}
                      onChange={handleParamsChange}
                      data-type={e.type}
                    />
                  )
                } else {
                  inside = (
                    <Input id={e.id} value={e.value} key={i} onChange={handleParamsChange} placeholder={e.fieldName} />
                  )
                }
                return (
                  <div key={e.fieldName}>
                    <Text color="textSubtle">{TranslateString(107, e.fieldName)}</Text>
                    {inside}
                  </div>
                )
              })}
            </fieldset>
            <br />
            <RowBetween>
              <Text color="textSubtle" fontSize="16px">
                Owner Token Share (%):
              </Text>
              <Input
                type="number"
                scale="lg"
                step={0.25}
                min={0}
                max={DEPLOYER_MAX_OWNER_SHARE}
                value={ownerShare}
                onChange={handleOwnerShareChange}
                style={{ width: '30%' }}
              />
            </RowBetween>
            <br />
            <RowBetween>
              <Text color="textSubtle" fontSize="16px">
                Liquidity Pool Share (%):
              </Text>
              <Input
                type="number"
                scale="lg"
                step={0.25}
                min={85}
                max={100}
                value={liquidityShare}
                onChange={handleLiquidityShareChange}
                style={{ width: '30%' }}
              />
            </RowBetween>
            <br />
            <Text color={theme.colors.text}>{TranslateString(107, 'Step 2')}</Text>
            <Text color="textSubtle" fontSize="17px">
              {TranslateString(107, 'Choose token pair and initial liquidity amount.')}
            </Text>
            <br />
            <CurrencyInputPanel
              value={formattedAmounts[Field.INPUT]}
              onUserInput={handleTypeInput}
              showMaxButton={false}
              currency={currencies[Field.INPUT]}
              onCurrencySelect={handleInputSelect}
              id="create-token-currency"
            />
            <br />
            <Text color={theme.colors.text}>{TranslateString(107, 'Step 3')}</Text>
            <Text color="textSubtle" fontSize="17px">
              {TranslateString(107, 'Choose liquidity lock time then deploy token.')}
            </Text>
            <br />
            <RowBetween>
              <Text color="textSubtle" fontSize="14px">
                Liquidity Lock Time (days):
              </Text>
              <Input
                type="number"
                scale="lg"
                step={1}
                min={LIQUIDITY_MIN_LOCK_TIME}
                value={daysToLock}
                onChange={handleDaysToLockChange}
                style={{ width: '30%' }}
                disabled={lockForever}
              />
            </RowBetween>
            {!lockForever && daysToLock < LIQUIDITY_RECOMMENDED_LOCK_TIME ? (
              <Box marginTop={2}>
                <Text color="warning" fontSize="12px">
                  It is recommended to keep the lock time {LIQUIDITY_RECOMMENDED_LOCK_TIME} days or higher
                </Text>
              </Box>
            ) : (
              ''
            )}
            or
            <RowBetween>
              <Text color="textSubtle" fontSize="14px">
                Lock forever
              </Text>
              <Box>
                <Toggle
                  scale={'md'}
                  checked={lockForever}
                  onChange={() => {
                    handleLockForever(!lockForever)
                  }}
                />
              </Box>
            </RowBetween>
            <BottomGrouping>
              {!account ? (
                <ConnectWalletButton width="100%" />
              ) : showApproveFlow ? (
                <RowBetween>
                  <Button
                    onClick={approveCallback}
                    disabled={approval !== ApprovalState.NOT_APPROVED || approvalSubmitted}
                    style={{ width: '48%' }}
                    variant={approval === ApprovalState.APPROVED ? 'success' : 'primary'}
                  >
                    {approval === ApprovalState.PENDING ? (
                      <AutoRow gap="6px" justify="center">
                        Approving <Loader stroke="white" />
                      </AutoRow>
                    ) : approvalSubmitted && approval === ApprovalState.APPROVED ? (
                      'Approved'
                    ) : (
                      `Approve ${currencies[Field.INPUT]?.symbol}`
                    )}
                  </Button>
                  <Button
                    id="deploy-token-button"
                    style={{ width: '48%' }}
                    disabled={!!deployInputError || approval !== ApprovalState.APPROVED}
                    onClick={() => {
                      setDeployState({
                        paramsToConfirm: params,
                        attemptingTxn: false,
                        deployErrorMessage: undefined,
                        showConfirm: true,
                        txHash: undefined,
                      })
                    }}
                  >
                    {deployInputError || 'Deploy Token'}
                  </Button>
                </RowBetween>
              ) : (
                <Button
                  id="upload-contract-button"
                  width="100%"
                  disabled={!!deployInputError}
                  onClick={() => {
                    setDeployState({
                      paramsToConfirm: params,
                      attemptingTxn: false,
                      deployErrorMessage: undefined,
                      showConfirm: true,
                      txHash: undefined,
                    })
                  }}
                >
                  {deployInputError || 'Deploy Token'}
                </Button>
              )}
              {showApproveFlow && <ProgressSteps steps={[approval === ApprovalState.APPROVED]} />}
            </BottomGrouping>
          </CardBody>
        </AutoColumn>
      </AppBody>
    </>
  )
}
