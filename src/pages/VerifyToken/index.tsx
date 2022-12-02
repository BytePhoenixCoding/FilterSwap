import React, { useCallback, useEffect, useContext, useState, useMemo } from 'react'
import styled, { ThemeContext } from 'styled-components'
import { BigNumber } from 'ethers'
import { TransactionResponse } from '@ethersproject/abstract-provider'

import { VERIFICATION_REQUEST_DEADLINE, VERIFICATION_REQUEST_FEE } from '../../constants'
import AppBody from '../AppBody'

import { Box, Button, CardBody, Text, Input, Link } from '../../custom_modules/@filterswap-libs/uikit'
import { Currency, Token } from '../../custom_modules/@filterswap-libs/sdk'

import Question from 'components/QuestionHelper'
import { AutoRow, RowBetween } from 'components/Row'
import { AutoColumn } from 'components/Column'
import ConfirmVerifyModal, { RequestType } from 'components/VerifyToken/ConfirmVerifyModal'
import ConnectWalletButton from 'components/ConnectWalletButton'
import PageHeader from 'components/PageHeader'
import { Dots, BottomGrouping } from 'components/swap/styleds'

import { calculateGasMargin, getVerifierContract, isAddress } from '../../utils'

import { useActiveWeb3React } from 'hooks'
import { useToken } from 'hooks/Tokens'
import { useVerifierContract } from 'hooks/useContract'

import { useSingleCallResult } from 'state/multicall/hooks'
import { useTransactionAdder } from 'state/transactions/hooks'

enum VerificationStatus {
  NO_REQUEST,
  AWAITING_PROCESSING,
  REQUEST_REJECTED,
  REQUEST_ACCEPTED,
}

export default function VerifyToken() {
  const theme = useContext(ThemeContext)

  // modal and loading
  const [{ showConfirm, verifyErrorMessage, attemptingTxn, tokenSubmitted, txHash, requestType }, setVerifyState] = useState<{
    showConfirm: boolean
    attemptingTxn: boolean
    tokenSubmitted: string | undefined
    verifyErrorMessage: string | undefined
    txHash: string | undefined
    token: Token | null | undefined
    requestType
  }>({
    showConfirm: false,
    attemptingTxn: false,
    tokenSubmitted: undefined,
    verifyErrorMessage: undefined,
    txHash: undefined,
    token: undefined,
    requestType: undefined,
  })

  const { account, chainId, library } = useActiveWeb3React()

  const addTransaction = useTransactionAdder()

  const onSubmitRequest = async (verificationTip = 0) => {
    if (!chainId || !library || !account || !token) return
    const verifyContract = getVerifierContract(chainId, library, account)

    let estimate
    let method: (...args: any) => Promise<TransactionResponse>
    let args: Array<string | string[] | number>
    let value: BigNumber | null

    estimate = verifyContract.estimateGas.submitVerificationRequest
    method = verifyContract.submitVerificationRequest
    args = [token.address]
    value = BigNumber.from((VERIFICATION_REQUEST_FEE + verificationTip * 10 ** Currency.ETHER.decimals).toString())
    setVerifyState((prevState) => ({ ...prevState, attemptingTxn: true, tokenSubmitted: undefined }))
    await estimate(...args, value ? { value } : {})
      .then((estimatedGasLimit) =>
        method(...args, {
          ...(value ? { value } : {}),
          gasLimit: calculateGasMargin(estimatedGasLimit),
        })
      )
      .then((response) => {
        setVerifyState((prevState) => ({ ...prevState, txHash: response.hash, attemptingTxn: false, tokenSubmitted: token.address }))

        addTransaction(response, {
          summary: `Making Verification Request for ${token.name} (${token.symbol})`,
        })
      })
      .catch((e) => {
        setVerifyState((prevState) => ({ ...prevState, attemptingTxn: false }))

        // we only care if the error is something _other_ than the user rejected the tx
        if (e?.code !== 4001) {
          console.error(e)
        }
      })
  }
  const onCancelRequest = async () => {
    if (!chainId || !library || !account || !token) return
    const verifyContract = getVerifierContract(chainId, library, account)

    let estimate
    let method: (...args: any) => Promise<TransactionResponse>
    let args: Array<string | string[] | number>
    let value: BigNumber | null

    estimate = verifyContract.estimateGas.claimExpiredRequestFee
    method = verifyContract.claimExpiredRequestFee
    args = [token.address]
    value = BigNumber.from(0)

    setVerifyState((prevState) => ({ ...prevState, attemptingTxn: true }))
    await estimate(...args, value ? { value } : {})
      .then((estimatedGasLimit) =>
        method(...args, {
          ...(value ? { value } : {}),
          gasLimit: calculateGasMargin(estimatedGasLimit),
        })
      )
      .then((response) => {
        setVerifyState((prevState) => ({ ...prevState, txHash: response.hash, attemptingTxn: false }))

        addTransaction(response, {
          summary: `Cancelling Verification Request for ${token.name} (${token.symbol})`,
        })
      })
      .catch((e) => {
        setVerifyState((prevState) => ({ ...prevState, attemptingTxn: false }))

        // we only care if the error is something _other_ than the user rejected the tx
        if (e?.code !== 4001) {
          console.error(e)
        }
      })
  }

  const handleConfirmDismiss = useCallback(() => {
    setVerifyState((prevState) => ({ ...prevState, showConfirm: false }))
  }, [setVerifyState])

  const [addressToVerify, setAddress] = useState('')

  const handleAddressChange = (e) => setAddress(e.target.value)
  const token = useToken(isAddress(addressToVerify) ? addressToVerify : undefined)

  const handleAcceptChanges = useCallback(() => {
    setVerifyState((prevState) => ({ ...prevState, token }))
  }, [token])

  let verifyInputError: string | Element | any = ''
  
  const verifierContract = useVerifierContract()
  const verificationRequestStatuses = useSingleCallResult(verifierContract, 'verificationRequestStatuses', [
    isAddress(addressToVerify) ? addressToVerify : undefined,
  ])
  const verificationRequestDeadlines = useSingleCallResult(verifierContract, 'verificationRequestDeadlines', [
    isAddress(addressToVerify) ? addressToVerify : undefined,
  ])
  const verificationRequestCreator = useSingleCallResult(verifierContract, 'verificationRequestCreator', [
    isAddress(addressToVerify) ? addressToVerify : undefined,
  ])
  const verificationStatus = verificationRequestStatuses?.result?.[0].toNumber()
  const verificationDeadline = new Date(0)
  verificationDeadline.setUTCSeconds(verificationRequestDeadlines?.result?.[0].toNumber())
  const verificationCreator = verificationRequestCreator?.result?.[0]
  const verificationReqExpired: boolean =
    token?.verified ||
    (verificationStatus == VerificationStatus.AWAITING_PROCESSING && verificationDeadline.getTime() < Date.now())

  let verificationStatusText
  switch (verificationStatus) {
    case VerificationStatus.NO_REQUEST:
      verificationStatusText = 'No request submitted'
      break
    case VerificationStatus.AWAITING_PROCESSING:
      verificationStatusText = 'Request submitted, under review...'
      if (verificationCreator != account) {
        verifyInputError = 'Request submitted by another user'
      } else if (!verificationReqExpired) {
        verifyInputError = 'Verification deadline not passed'
      }
      break
    case VerificationStatus.REQUEST_REJECTED:
      const questionTextElement = React.createElement(
        "div",
        {style: {display: "grid", gridGap: "12px"}},
        React.createElement("span", null, "Your verification request has been rejected. Our team has reviewed this token and have decided it does not fit the criteria to be verified on our platform."),
        React.createElement("span", null, "You have been refunded 50% of the initial verification fee."),
        React.createElement("span", null, "You can view our criteria ",React.createElement(Link, {style:{display:"inline"},href:"/"}, "here"),". If you have any other questions, please contact us ",React.createElement(Link, {style:{display:"inline"},href:"/"}, "here")," on Telegram.")
      )
      verificationStatusText = <>
        Request rejected
        <Question text={questionTextElement} />
        </>
      verifyInputError = 'Request rejected.'
      break
    case VerificationStatus.REQUEST_ACCEPTED:
      verificationStatusText = 'Request accepted.'
      break
    default:
      verificationStatusText = 'Unknown error, contact support.'
      break
  }

  if (!addressToVerify) {
    verifyInputError = 'Enter token address'
  } else if (token === null) {
    verifyInputError = <Dots>Loading</Dots>
  } else if (token === undefined) {
    verifyInputError = 'No token found'
  } else if (token.verified == undefined) {
    verifyInputError = <Dots>Loading Token Status</Dots>
  } else if (token.verified || verificationStatus == VerificationStatus.REQUEST_ACCEPTED) {
    verifyInputError = 'Token already verified!'
  } else if (verificationStatus == VerificationStatus.NO_REQUEST && tokenSubmitted == token.address) {
    verifyInputError = <Dots>Submitting verification request</Dots>
  }

  const handleVerificationRequest = (tip: number) => {
    onSubmitRequest(tip)
  }
  const handleVerificationCancellation = () => {
    onCancelRequest()
  }

  return (
    <>
      <AppBody>
        <PageHeader
          title={'Token Verification'}
          description={'Submit a new verification request for a token, or check the status of an existing request.'}
          hideSettings={true}
        ></PageHeader>
        <AutoColumn gap="lg" justify="center">
          <ConfirmVerifyModal
            isOpen={showConfirm}
            onAcceptChanges={handleAcceptChanges}
            attemptingTxn={attemptingTxn}
            txHash={txHash}
            onConfirm={
              requestType == RequestType.SUBMIT_REQUEST ? handleVerificationRequest : handleVerificationCancellation
            }
            verifyErrorMessage={verifyInputError}
            onDismiss={handleConfirmDismiss}
            token={token}
            requestType={requestType}
          />
          <CardBody>
            <>
              <Text color="textSubtle">
                If you submit a verification request and it isn't processed within{' '}
                {VERIFICATION_REQUEST_DEADLINE / 86400} days, you can claim back the full fee amount.
              </Text>
              <Box mt={2}>
                <Text fontSize="16px" mb={2}>
                  Token to Verify
                </Text>
                <Input
                  value={addressToVerify}
                  placeholder={'Enter token address here'}
                  onChange={handleAddressChange}
                ></Input>
              </Box>
              <BottomGrouping>
                {token ? (
                  <Box mb={1}>
                    <RowBetween>
                      <Text as="span">Token:</Text>
                      <Text ml={2} color="textSubtle" as="span">
                        {token.name} ({token.symbol}) <br />
                      </Text>
                    </RowBetween>
                    <RowBetween>
                      <Text as="span">Status:</Text>
                      <Text
                        ml={2}
                        color={
                          token.verified || verificationStatus == VerificationStatus.AWAITING_PROCESSING
                            ? 'warning'
                            : token.verified || verificationStatus == VerificationStatus.REQUEST_ACCEPTED
                            ? 'success'
                            : verificationStatus == VerificationStatus.REQUEST_REJECTED
                            ? 'failure'
                            : 'textSubtle'
                        }
                        as="span"
                      >
                        {token.verified || verificationStatus == VerificationStatus.REQUEST_ACCEPTED ? (
                          'Token Verified'
                        ) : verificationRequestStatuses.loading ? (
                          <Dots>Loading</Dots>
                        ) : (
                          verificationStatusText
                        )}
                      </Text>
                    </RowBetween>
                    {!verificationReqExpired && verificationDeadline.getTime() != 0 && verificationDeadline.getTime() > Date.now() && (
                      <RowBetween>
                        <Text as="span">Request Deadline:</Text>
                        <Text ml={2} as="span" color="textSubtle">
                          {verificationDeadline.toLocaleString()}
                        </Text>
                      </RowBetween>
                    )}
                  </Box>
                ) : (
                  ''
                )}
                {!account ? (
                  <ConnectWalletButton width="100%" />
                ) : verificationStatus == VerificationStatus.AWAITING_PROCESSING ? (
                  <Button
                    id="request-cancel-verify-button"
                    variant="danger"
                    width="100%"
                    disabled={!!verifyInputError}
                    onClick={() => {
                      setVerifyState({
                        showConfirm: true,
                        attemptingTxn: false,
                        tokenSubmitted: undefined,
                        verifyErrorMessage: undefined,
                        txHash: undefined,
                        token: token,
                        requestType: RequestType.CANCEL_REQUEST,
                      })
                    }}
                  >
                    {verifyInputError || 'Cancel verification request'}
                  </Button>
                ) : (
                  <Button
                    id="request-verify-button"
                    width="100%"
                    disabled={!!verifyInputError}
                    onClick={() => {
                      setVerifyState({
                        showConfirm: true,
                        attemptingTxn: false,
                        tokenSubmitted: undefined,
                        verifyErrorMessage: undefined,
                        txHash: undefined,
                        token: token,
                        requestType: RequestType.SUBMIT_REQUEST,
                      })
                    }}
                  >
                    {verifyInputError || 'Submit verification request'}
                  </Button>
                )}
              </BottomGrouping>
            </>
          </CardBody>
        </AutoColumn>
      </AppBody>
    </>
  )
}
