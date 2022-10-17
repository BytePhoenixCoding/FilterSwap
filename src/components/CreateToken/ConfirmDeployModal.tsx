import { Trade } from '../../custom_modules/@filterswap-libs/sdk/dist'
import { Currency } from '../../custom_modules/@filterswap-libs/sdk'
import { useCallback, useMemo } from 'react'
import TransactionConfirmationModal, {
  ConfirmationModalContent,
  TransactionErrorContent,
} from '../TransactionConfirmationModal'
import DeployModalFooter from './DeployModalFooter'

export default function ConfirmDeployModal({
  params,
  originalTrade,
  calculatedMintFee,
  inputCurrency,
  onAcceptChanges,
  onConfirm,
  onDismiss,
  deployErrorMessage,
  isOpen,
  attemptingTxn,
  txHash,
}: {
  isOpen: boolean
  params: any
  originalTrade: object | undefined
  calculatedMintFee: number | undefined
  inputCurrency: Currency | undefined
  attemptingTxn: boolean
  txHash: string | undefined
  onAcceptChanges: () => void
  onConfirm: () => void
  deployErrorMessage: string | undefined
  onDismiss: () => void
}) {
  const showAcceptChanges = useMemo(() => Boolean(true), [params])

  // const modalHeader = useCallback(() => {
  //   return trade ? (
  //     <SwapModalHeader
  //       trade={trade}
  //       allowedSlippage={allowedSlippage}
  //       recipient={recipient}
  //       showAcceptChanges={showAcceptChanges}
  //       onAcceptChanges={onAcceptChanges}
  //     />
  //   ) : null
  // }, [allowedSlippage, onAcceptChanges, recipient, showAcceptChanges, trade])

  const modalBottom = useCallback(() => {
    return params ? (
      <DeployModalFooter
        onConfirm={onConfirm}
        params={params}
        disabledConfirm={false}
        deployErrorMessage={deployErrorMessage}
        calculatedMintFee={calculatedMintFee}
        inputCurrency={inputCurrency}
      />
    ) : null
  }, [onConfirm, showAcceptChanges, deployErrorMessage, params, calculatedMintFee])

  // text to show while loading
  const pendingText = `Creating Token ${params.tokenName}...`

  const falsey = () => <></>

  const confirmationContent = useCallback(
    () =>
      deployErrorMessage ? (
        <TransactionErrorContent onDismiss={onDismiss} message={deployErrorMessage} />
      ) : (
        <ConfirmationModalContent
          title="Confirm Deploy"
          onDismiss={onDismiss}
          // topContent={modalHeader}
          topContent={falsey}
          bottomContent={modalBottom}
        />
      ),
    [
      onDismiss,
      modalBottom,
      // modalHeader,
      deployErrorMessage,
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
