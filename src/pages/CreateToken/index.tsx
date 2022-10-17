// TODO: Add check for base token verified on currency swap
// TODO: Add check to see if 'transfer amount exceeds allowance'
// TODO: Add wrap fix
import React, { useCallback, useEffect, useContext, useState, useMemo } from 'react'
import styled, { ThemeContext } from 'styled-components'
import { toInteger } from 'lodash'

import AppBody from '../AppBody'
import { Box, Button, Toggle, CardBody, Text, Heading, Input } from '../../custom_modules/@filterswap-libs/uikit'

import CardNav from 'components/CardNav'
import { AutoRow, RowBetween } from 'components/Row'
import { AutoColumn } from 'components/Column'
import CurrencyInputPanel from 'components/CurrencyInputPanel'
import ConfirmDeployModal from 'components/CreateToken/ConfirmDeployModal'

import useI18n from 'hooks/useI18n'
import { useDeployCallback } from 'hooks/useDeployCallback'
import { ApprovalState, useApproveCallbackFromDeployParams } from 'hooks/useApproveCallback'

import { Field } from 'state/swap/actions'
import { BottomGrouping } from 'components/swap/styleds'
import { useDerivedDeployInfo, useDeployActionHandlers, useDeployState } from 'state/deploy/hooks'

import { useUserDeadline } from 'state/user/hooks'

import { DEPLOYER_MAX_OWNER_SHARE } from 'constants/index'
import { useActiveWeb3React } from 'hooks'
import Loader from 'components/Loader'
import ConnectWalletButton from 'components/ConnectWalletButton'
import ProgressSteps from 'components/ProgressSteps'

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

  const [lockForever, setLockForever] = useState(false)
  const [daysToLock, setDaysToLock] = useState(parseInt(process.env.REACT_APP_LIQUIDITY_MIN_LOCK_TIME!))
  const handleDaysToLockChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
    const { value: inputValue } = evt.target

    const num: number = parseFloat(inputValue)
    const min: number = parseFloat(evt.target.min || '-1')
    const max: number = parseFloat(evt.target.max || '1000000000000')

    setDaysToLock(Math.min(Math.max(num, min), max))
  }

  const maxOwnerShare = DEPLOYER_MAX_OWNER_SHARE
  const [ownerShare, setOwnerShare] = useState(0)
  const [liquidityShare, setLiquidityShare] = useState(100)
  const handleOwnerShareChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
    let value = toInteger(evt.target.value)

    if (value > maxOwnerShare) {
      value = maxOwnerShare
    }
    setOwnerShare(value)
    setLiquidityShare(100 - value)
  }
  const handleLiquidityShareChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
    let value = toInteger(evt.target.value)

    if (value < 100 - maxOwnerShare) {
      value = 100 - maxOwnerShare
    } else if (value > 100) {
      value = 100
    }

    setLiquidityShare(value)
    setOwnerShare(100 - value)
  }

  const { onSwitchTokens, onCurrencySelection, onUserInput } = useDeployActionHandlers()

  const {
    params,
    handleParamChange,
    selectedTemplate,
    handleSelectChange,
    selectTemplates,
    createOptions,
    currencyBalances,
    parsedAmount,
    currencies,
    calculatedMintFee,
    inputError: deployInputError,
  } = useDerivedDeployInfo()
  const { independentField, typedValue } = useDeployState()

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
  const [approval, approveCallback] = useApproveCallbackFromDeployParams(parsedAmounts[Field.INPUT])

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

  // the callback to execute the create
  const { callback: deployCallback, error: deployCallbackError } = useDeployCallback(
    params,
    ownerShare,
    daysToLock,
    lockForever,
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
    setDeployState((prevState) => ({ ...prevState, showConfirm: false }))

    // if there was a tx hash, we want to clear the input
    if (txHash) {
      onUserInput(Field.INPUT, '')
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
        <AutoColumn gap="lg" justify="center">
          <ConfirmDeployModal
            isOpen={showConfirm}
            calculatedMintFee={calculatedMintFee}
            inputCurrency={currencies[Field.INPUT]}
            params={params}
            originalTrade={paramsToConfirm}
            onAcceptChanges={handleAcceptChanges}
            attemptingTxn={attemptingTxn}
            txHash={txHash}
            onConfirm={handleDeploy}
            deployErrorMessage={deployErrorMessage}
            onDismiss={handleConfirmDismiss}
          />
          <CardBody>
            <AutoColumn gap="12px" style={{ width: '100%' }}>
              <Heading mb="8px">{TranslateString(107, 'Create Token')}</Heading>
              <Text color="textSubtle" fontSize="16px">
                {TranslateString(
                  107,
                  'To create a token on FilterSwap, deploy a token contract then add liquidity to make it tradeable.'
                )}
              </Text>
            </AutoColumn>
            <CardBody>
              <Text color={theme.colors.text}>{TranslateString(107, 'Step 1')}</Text>
              <Text color="textSubtle" fontSize="17px">
                {TranslateString(107, 'Choose a token template below.')}
              </Text>
              <br />
              <div style={{ display: 'flex', gap: '5%', justifyContent: 'center' }}>
                <Select onChange={handleSelectChange}>
                  {selectTemplates.map((e, i) => (
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
                {(createOptions.options || selectTemplates[0].options).map((e, i) => {
                  var inside
                  if (e.type == 'number') {
                    inside = (
                      <Input
                        id={e.id}
                        type="number"
                        scale="lg"
                        step={1}
                        min={e.min || 0}
                        max={e.max || 1000000000000000}
                        value={params[e.id]}
                        onChange={handleParamChange}
                      />
                    )
                  } else {
                    inside = (
                      <Input id={e.id} value={e.value} key={i} onChange={handleParamChange} placeholder={e.fieldName} />
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
                  step={1}
                  min={0}
                  max={process.env.REACT_APP_DEPLOYER_MAX_OWNER_SHARE}
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
                  step={1}
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
                id="create-token-food"
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
                  min={process.env.REACT_APP_LIQUIDITY_MIN_LOCK_TIME}
                  value={daysToLock}
                  onChange={handleDaysToLockChange}
                  style={{ width: '30%' }}
                  disabled={lockForever}
                />
              </RowBetween>
              or
              <RowBetween>
                <Text color="textSubtle" fontSize="14px">
                  Lock forever
                </Text>
                <Box>
                  <Toggle scale={'md'} checked={lockForever} onChange={() => setLockForever(!lockForever)} />
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
          </CardBody>
        </AutoColumn>
      </AppBody>
    </>
  )
}
