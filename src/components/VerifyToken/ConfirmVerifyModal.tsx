import { useCallback, useMemo } from 'react'
import { Text } from '@pancakeswap-libs/uikit'
import { Currency, Token } from 'custom_modules/@filterswap-libs/sdk'
import { Button } from 'custom_modules/@filterswap-libs/uikit/dist/index.esm'

import { tryParseAmount } from 'state/swap/hooks'

import { DeployCallbackError } from '../CreateToken/styleds'
import { VERIFICATION_REQUEST_FEE } from '../../constants'
import TransactionConfirmationModal, {
  ConfirmationModalContent,
  TransactionErrorContent,
} from '../TransactionConfirmationModal'

import { AutoColumn } from 'components/Column'
import QuestionHelper from 'components/QuestionHelper'
import { AutoRow, RowBetween, RowFixed } from 'components/Row'

export enum RequestType {
  SUBMIT_REQUEST,
  CANCEL_REQUEST,
}

export default function ConfirmVerifyRequestModal({
  onAcceptChanges,
  onConfirm,
  onDismiss,
  verifyErrorMessage,
  isOpen,
  attemptingTxn,
  txHash,
  token,
  requestType,
}: {
  isOpen: boolean
  attemptingTxn: boolean
  txHash: string | undefined
  onAcceptChanges: () => void
  onConfirm: () => void
  verifyErrorMessage: string | undefined
  onDismiss: () => void
  token: Token | null | undefined
  requestType: RequestType
}) {
  const showAcceptChanges = useMemo(() => Boolean(true), [])

  const verificationFee = tryParseAmount(
    (VERIFICATION_REQUEST_FEE / 10 ** Currency.ETHER.decimals).toString(),
    Currency.ETHER
  )
  const modalBottom = useCallback(() => {
    return (
      <>
        <AutoColumn gap="0px">
          <RowBetween>
            <Text fontSize="14px">Token to Verify</Text>
            <Text fontSize="14px">
              {token?.name} ({token?.symbol})
            </Text>
          </RowBetween>
          {requestType == RequestType.SUBMIT_REQUEST ? (
            <RowBetween>
              <RowFixed>
                <Text fontSize="14px">Token Verification Fee</Text>
                <QuestionHelper
                  text={
                    'Verifying a Token has a fee associated to the work put into making sure each token is legitimate. If FilterSwap cannot complete this in a timely manner you will be refunded.'
                  }
                />
              </RowFixed>
              <RowFixed>
                <Text fontSize="14px">
                  {verificationFee?.toSignificant(5)} {Token.ETHER?.symbol}
                </Text>
              </RowFixed>
            </RowBetween>
          ) : (
            ''
          )}
        </AutoColumn>

        <AutoRow>
          <Button onClick={onConfirm} mt="10px" id="confirm-swap-or-send" width="100%">
            {requestType == RequestType.SUBMIT_REQUEST ? 'Submit' : 'Cancel'} Request
          </Button>

          {verifyErrorMessage ? <DeployCallbackError error={verifyErrorMessage} /> : null}
        </AutoRow>
      </>
    )
  }, [onConfirm, showAcceptChanges, verifyErrorMessage])

  // text to show while loading
  const pendingText = `${
    requestType == RequestType.SUBMIT_REQUEST ? 'Requesting' : 'Cancelling'
  } Token Verification for ${token?.name || 'ERROR'}...`

  const modalTop = () => <></>

  const confirmationContent = useCallback(
    () =>
      verifyErrorMessage ? (
        <TransactionErrorContent onDismiss={onDismiss} message={verifyErrorMessage} />
      ) : (
        <ConfirmationModalContent
          title={`Confirm ${requestType == RequestType.SUBMIT_REQUEST ? 'Request' : 'Cancellation'} Details`}
          onDismiss={onDismiss}
          // topContent={modalHeader}
          topContent={modalTop}
          bottomContent={modalBottom}
        />
      ),
    [
      onDismiss,
      modalBottom,
      // modalHeader,
      verifyErrorMessage,
    ]
  )

  return (
    <TransactionConfirmationModal
      isOpen={isOpen}
      onDismiss={onDismiss}
      attemptingTxn={attemptingTxn}
      hash={txHash}
      content={confirmationContent}
      pendingText={pendingText}
    />
  )
}
