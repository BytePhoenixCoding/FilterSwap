import { useCallback, useMemo, useState } from 'react'
import { Currency, CurrencyAmount, Token } from 'custom_modules/@filterswap-libs/sdk'
import { Button, Toggle, Input, Text } from 'custom_modules/@filterswap-libs/uikit'

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
  onConfirm: any
  verifyErrorMessage: string | undefined
  onDismiss: () => void
  token: Token | null | undefined
  requestType: RequestType
}) {
  const showAcceptChanges = useMemo(() => Boolean(true), [])

  const [addTip, setAddTip] = useState(false)
  const [verificationTip, setVerificationTip] = useState('0')
  const handleTipValueChange = (e) => {
    const value = Math.min(Math.max(e.target.value, 0), 100000000000000000000).toString()
    setVerificationTip(value)
  }
  const verificationFee = tryParseAmount(
    (VERIFICATION_REQUEST_FEE / 10 ** Currency.ETHER.decimals).toString(),
    Currency.ETHER
  )
  const verificationTipAmount = tryParseAmount(verificationTip, Currency.ETHER)

  const totalFee =
    addTip && verificationTipAmount && verificationFee ? verificationFee.add(verificationTipAmount) : verificationFee
  const modalBottom = useCallback(() => {
    return (
      <>
        <AutoColumn gap="4px">
          {requestType == RequestType.SUBMIT_REQUEST ? (
            <AutoRow gap="4px">
              <RowBetween>
                <RowFixed>
                  <Text fontSize="18px">Add Verification Tip?</Text>
                  <QuestionHelper text={'Adding a tip will ensure your request is prioritised in the queue.'} />
                </RowFixed>
                <RowFixed>
                  <Toggle scale={'sm'} checked={addTip} onChange={() => setAddTip(!addTip)} />
                </RowFixed>
              </RowBetween>
              <RowBetween>
                <RowFixed style={{ flexGrow: 1 }}>
                  <Input
                    type="number"
                    step={0.01}
                    min={0}
                    value={verificationTip}
                    onChange={handleTipValueChange}
                    disabled={!addTip}
                  />
                </RowFixed>
                <RowFixed>
                  <Text paddingLeft={2}>BNB</Text>
                </RowFixed>
              </RowBetween>
            </AutoRow>
          ) : (
            ''
          )}
          <RowBetween>
            <Text fontSize="14px">Token to Verify</Text>
            <Text fontSize="14px">
              {token?.name} ({token?.symbol})
            </Text>
          </RowBetween>
          {requestType == RequestType.SUBMIT_REQUEST ? (
            <>
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
              {addTip ? (
                <RowBetween>
                  <RowFixed>
                    <Text fontSize="14px">Total Fee</Text>
                  </RowFixed>
                  <RowFixed>
                    <Text fontSize="14px">
                      {totalFee?.toSignificant(5)} {Token.ETHER?.symbol}
                    </Text>
                  </RowFixed>
                </RowBetween>
              ) : (
                ''
              )}
            </>
          ) : (
            ''
          )}
        </AutoColumn>

        {/* (!addTip ? 0  : parseInt(verificationTip)) =>  */}
        <AutoRow>
          <Button
            onClick={
              requestType == RequestType.SUBMIT_REQUEST
                ? () => onConfirm(!addTip ? 0 : parseFloat(verificationTip))
                : onConfirm
            }
            mt="10px"
            id="confirm-swap-or-send"
            width="100%"
          >
            {requestType == RequestType.SUBMIT_REQUEST ? 'Submit' : 'Cancel'} Request
          </Button>

          {verifyErrorMessage ? <DeployCallbackError error={verifyErrorMessage} /> : null}
        </AutoRow>
      </>
    )
  }, [onConfirm, showAcceptChanges, addTip, verificationTip, verifyErrorMessage])

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
