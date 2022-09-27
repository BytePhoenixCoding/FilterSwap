import React, { useCallback, useEffect, useContext, useState } from 'react'
import styled, { ThemeContext } from 'styled-components'
import { toInteger } from 'lodash'
import { isFunctionDeclaration } from 'typescript'

import AppBody from '../AppBody'
import {
  Box,
  Button,
  Dropdown,
  Toggle,
  CardBody,
  Text,
  Heading,
  AddIcon,
  Input,
} from '../../custom_modules/@filterswap-libs/uikit'
import { Currency, currencyEquals, ETHER, TokenAmount, WETH } from '../../custom_modules/@filterswap-libs/sdk'

import CardNav from 'components/CardNav'
import Row, { RowBetween, RowFlat } from 'components/Row'
import { AutoColumn, ColumnCenter } from 'components/Column'
import CurrencyInputPanel from 'components/CurrencyInputPanel'

import useI18n from 'hooks/useI18n'
import useWrapCallback, { WrapType } from 'hooks/useWrapCallback'
import { ApprovalState, useApproveCallbackFromTrade } from 'hooks/useApproveCallback'
import { useCurrency } from 'hooks/Tokens'

import { Field } from 'state/swap/actions'
import { useDefaultsFromURLSearch, useDerivedSwapInfo, useSwapActionHandlers, useSwapState } from 'state/swap/hooks'
import { useIsExpertMode, useExpertModeManager, useUserDeadline, useUserSlippageTolerance } from 'state/user/hooks'

import { currencyId } from 'utils/currencyId'
import { maxAmountSpend } from 'utils/maxAmountSpend'

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

export default function Pool() {
  const theme = useContext(ThemeContext)
  const TranslateString = useI18n()

  const [lockForever, setLockForever] = useState(false)
  const [daysToLock, setDaysToLock] = useState(7)
  const handleDaysToLockChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
    const { value: inputValue } = evt.target
    setDaysToLock(parseFloat(inputValue))
  }
  function doNull() {
    return false
  }

  const selectOptions = [
    {
      name: 'Basic',
      description: 'The most basic token template. No fees, nothing.',
      options: [
        { fieldName: 'Token Name', id: 'tokenName' },
        { fieldName: 'Token Symbol', id: 'tokenSymbol' },
        { fieldName: 'Total Supply', id: 'totalSupply', type: 'number' },
      ],
    },
    {
      name: 'Deflationary (Buy/Sell Tax)',
      description: 'Deflationary token template, with a buy / sell tax.',
      options: [
        { fieldName: 'Token Name', id: 'tokenNameTxt' },
        { fieldName: 'Token Symbol', id: 'tokenSymbol' },
        { fieldName: 'Total Supply', id: 'totalSupply', type: 'number', min: 0 },
        { fieldName: 'Buy Fee (0-20%)', id: 'buyFee', type: 'number', min: 0, max: 20 },
        { fieldName: 'Sell Fee (0-20%)', id: 'sellFee', type: 'number', min: 0, max: 20 },
      ],
    },
    {
      name: 'Deflationary with marketing wallet',
      description: 'Like the previous template, but a marketing address can be specified.',
      options: [
        { fieldName: 'Token Name', id: 'tokenNameTxt' },
        { fieldName: 'Token Symbol', id: 'tokenSymbol' },
        { fieldName: 'Total Supply', id: 'totalSupply', type: 'number', min: 0 },
        { fieldName: 'Buy Fee (0-20%)', id: 'totalSupply', type: 'number', min: 0, max: 20 },
        { fieldName: 'Sell Fee (0-20%)', id: 'sellFee', type: 'number', min: 0, max: 20 },
        { fieldName: 'Funding Address', id: 'fundingAddress', type: 'address' },
      ],
    },
  ]

  const [createParams, setCreateParams] = useState<any>(
    selectOptions[2].options
      .map((e) => ({
        ...e,
        value: e.type == 'number' ? '0' : '',
      }))
      .reduce((ac, a) => ({ ...ac, [a.id]: a.value }), {})
  )
  // console.log(createParams)
  const handleParamChange = (e) => {
    // console.log(e)
    setCreateParams({
      ...createParams,
      [e.target.id]: e.target.value,
    })
  }

  const [createOptions, setCreateOptions] = useState<any>([selectOptions[0]])
  const handleSelectChange = (e) => {
    const index = e.target.selectedIndex
    setCreateOptions(selectOptions[index])
    // console.log(index)
    // console.log(createParams)
  }

  const maxOwnerShare = 15
  const [ownerShare, setOwnerShare] = useState(0)
  const [liquiditiyShare, setLiquidityShare] = useState(100)
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

    if (value > 100 - maxOwnerShare) {
      value = 100 - maxOwnerShare
    }
    setLiquidityShare(value)
    setOwnerShare(100 - value)
  }

  // Currency Selector
  const loadedUrlParams = useDefaultsFromURLSearch()
  const [loadedInputCurrency, loadedOutputCurrency] = [
    useCurrency(loadedUrlParams?.inputCurrencyId),
    useCurrency(loadedUrlParams?.outputCurrencyId),
  ]

  const { onSwitchTokens, onCurrencySelection, onUserInput, onChangeRecipient } = useSwapActionHandlers()

  const { v2Trade, currencyBalances, parsedAmount, currencies, inputError: swapInputError } = useDerivedSwapInfo()
  const { independentField, typedValue, recipient } = useSwapState()
  const dependentField: Field = independentField === Field.INPUT ? Field.OUTPUT : Field.INPUT

  const handleTypeInput = useCallback(
    (value: string) => {
      onUserInput(Field.INPUT, value)
    },
    [onUserInput]
  )

  const [isExpertMode] = useExpertModeManager()

  // get custom setting values for user
  const [deadline] = useUserDeadline()
  const [allowedSlippage] = useUserSlippageTolerance()

  const { wrapType, execute: onWrap, inputError: wrapInputError } = useWrapCallback(
    currencies[Field.INPUT],
    currencies[Field.OUTPUT],
    typedValue
  )
  const showWrap: boolean = wrapType !== WrapType.NOT_APPLICABLE
  const trade = showWrap ? undefined : v2Trade

  // check whether the user has approved the router on the input token
  const [approval, approveCallback] = useApproveCallbackFromTrade(trade, allowedSlippage)

  // mark when a user has submitted an approval, reset onTokenSelection for input field
  const [approvalSubmitted, setApprovalSubmitted] = useState<boolean>(false)
  useEffect(() => {
    if (approval === ApprovalState.PENDING) {
      setApprovalSubmitted(true)
    }
  }, [approval, approvalSubmitted])

  const parsedAmounts = showWrap
    ? {
        [Field.INPUT]: parsedAmount,
        [Field.OUTPUT]: parsedAmount,
      }
    : {
        [Field.INPUT]: independentField === Field.INPUT ? parsedAmount : trade?.inputAmount,
        [Field.OUTPUT]: independentField === Field.OUTPUT ? parsedAmount : trade?.outputAmount,
      }

  const formattedAmounts = {
    [independentField]: typedValue,
    [dependentField]: showWrap
      ? parsedAmounts[independentField]?.toExact() ?? ''
      : parsedAmounts[dependentField]?.toSignificant(6) ?? '',
  }

  const handleInputSelect = useCallback(
    (inputCurrency) => {
      setApprovalSubmitted(false) // reset 2 step UI for approvals
      onCurrencySelection(Field.INPUT, inputCurrency)
    },
    [onCurrencySelection, setApprovalSubmitted, () => {}]
  )

  return (
    <>
      <CardNav activeIndex={2} />
      <AppBody>
        <AutoColumn gap="lg" justify="center">
          <CardBody>
            <AutoColumn gap="12px" style={{ width: '100%' }}>
              <Heading mb="8px">{TranslateString(107, 'Create Token')}</Heading>
              <Text color="textSubtle" fontSize="14px">
                {TranslateString(
                  107,
                  'To create a token on FilterSwap, deploy a token contract then add liquidity to make it tradeable.'
                )}
              </Text>
            </AutoColumn>

            <AutoColumn gap="0%" style={{ width: '100%' }}>
              <CardBody>
                <Text color={theme.colors.text}>{TranslateString(107, 'Step 1')}</Text>
                <Text color="textSubtle" fontSize="14px">
                  {TranslateString(
                    107,
                    'Create a token contract: either choose from a template below or upload your own contract.'
                  )}
                </Text>
                <br />
                <div style={{ display: 'flex', gap: '5%', justifyContent: 'center' }}>
                  {/* <select name="templateType" id="templateType" style={{ width: "30%" }} onChange={changeOption}>
                                    <option value="1">Basic</option>
                                    <option value="2">Taxed</option>
                                </select> */}

                  <Select onChange={handleSelectChange}>
                    {selectOptions.map((e, i) => (
                      <option key={i} value={i}>
                        {e.name}
                      </option>
                    ))}
                  </Select>

                  {/* <p>or</p>
                                <Button id="upload-contract-button" style={{ height: 25 }}>
                                    {TranslateString(168, 'Upload Contract')}
                                </Button> */}
                </div>
                <br />
                <fieldset>
                  <legend style={{ margin: '2%', padding: '1%' }}>Token Details</legend>
                  {/* <input type="text" id="tokenNameTxt" placeholder="Token Name" />
                  <input type="text" id="tokenSymbolTxt" placeholder="Token Symbol" />
                  <input type="number" id="tokenTotalSupplyNum" placeholder="Token Total Supply" /> */}
                  {(createOptions.options || selectOptions[0].options).map((e, i) => {
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
                          value={createParams[e.id]}
                          onChange={handleParamChange}
                          // style={{ width: '30%' }}
                          // disabled={lockForever}
                        />
                      )
                    } else {
                      inside = (
                        <Input
                          id={e.id}
                          value={e.value}
                          key={i}
                          onChange={handleParamChange}
                          placeholder={e.fieldName}
                        />
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
                    max={15}
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
                    value={liquiditiyShare}
                    onChange={handleLiquidityShareChange}
                    style={{ width: '30%' }}
                  />
                </RowBetween>
                <br />
                <Text color={theme.colors.text}>{TranslateString(107, 'Step 2')}</Text>
                <Text color="textSubtle" fontSize="14px">
                  {TranslateString(107, 'Choose token pair and token input amount.')}
                </Text>
                <br />
                <CurrencyInputPanel
                  value={formattedAmounts[Field.INPUT]}
                  onUserInput={handleTypeInput}
                  // onMax={() => {
                  //   onFieldAInput(maxAmounts[Field.CURRENCY_A]?.toExact() ?? '')
                  // }}
                  // label={
                  //   independentField === Field.INPUT && !showWrap && trade
                  //     ? TranslateString(196, 'To (estimated)')
                  //     : TranslateString(80, 'To')
                  // }
                  showMaxButton={false}
                  currency={currencies[Field.INPUT]}
                  onCurrencySelect={handleInputSelect}
                  otherCurrency={currencies[Field.OUTPUT]}
                  id="create-token-food"
                  // showCommonBases={false}
                />
                <br />
                <Text color={theme.colors.text}>{TranslateString(107, 'Step 3')}</Text>
                <Text color="textSubtle" fontSize="14px">
                  {TranslateString(107, 'Choose liquidity lock time then deploy token.')}
                </Text>
                <RowBetween>
                  <Text color="textSubtle" fontSize="16px">
                    Liquidity Lock Time (days):
                  </Text>
                  <Input
                    type="number"
                    scale="lg"
                    step={1}
                    min={1}
                    value={daysToLock}
                    onChange={handleDaysToLockChange}
                    style={{ width: '30%' }}
                    disabled={lockForever}
                  />
                </RowBetween>
                or
                <RowBetween>
                  <Text color="textSubtle" fontSize="16px">
                    Lock forever
                  </Text>
                  <Box>
                    {/* <Toggle scale={isSm || isXs ? 'sm' : 'md'} checked={lockForever} onChange={() => setLockForever(!lockForever)} /> */}
                    <Toggle scale={'md'} checked={lockForever} onChange={() => setLockForever(!lockForever)} />
                  </Box>
                </RowBetween>
                <br />
                <br />
                <Button id="upload-contract-button" style={{ width: '45%', float: 'left' }}>
                  {TranslateString(168, 'Approve')}
                </Button>
                <Button id="upload-contract-button" style={{ width: '45%', float: 'right' }}>
                  {TranslateString(168, 'Create Token')}
                </Button>
              </CardBody>
            </AutoColumn>
          </CardBody>
        </AutoColumn>
      </AppBody>
    </>
  )
}
