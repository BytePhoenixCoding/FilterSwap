import { currencyEquals, Trade } from '../../custom_modules/@filterswap-libs/sdk/dist'
import React, { useCallback, useMemo } from 'react'
import TransactionConfirmationModal, {
  ConfirmationModalContent,
  TransactionErrorContent,
} from '../TransactionConfirmationModal'
import DeployModalFooter from './DeployModalFooter'
// import DeployModalHeader from './SwapModalHeader'

/**
 * Returns true if the trade requires a confirmation of details before we can submit it
 * @param tradeA trade A
 * @param tradeB trade B
 */
function tradeMeaningfullyDiffers(tradeA: Trade, tradeB: Trade): boolean {
  return false
  // return (
  //   tradeA.tradeType !== tradeB.tradeType ||
  //   !currencyEquals(tradeA.inputAmount.currency, tradeB.inputAmount.currency) ||
  //   !tradeA.inputAmount.equalTo(tradeB.inputAmount) ||
  //   !currencyEquals(tradeA.outputAmount.currency, tradeB.outputAmount.currency) ||
  //   !tradeA.outputAmount.equalTo(tradeB.outputAmount)
  // )
}

export default function ConfirmDeployModal({
  params,
  calculatedMintFee,
  originalTrade,
  onAcceptChanges,
  allowedSlippage,
  onConfirm,
  onDismiss,
  recipient,
  deployErrorMessage,
  isOpen,
  attemptingTxn,
  txHash,
}: {
  isOpen: boolean
  params: object | undefined
  calculatedMintFee: number | undefined
  originalTrade: object | undefined
  attemptingTxn: boolean
  txHash: string | undefined
  recipient: string | null
  allowedSlippage: number
  onAcceptChanges: () => void
  onConfirm: () => void
  deployErrorMessage: string | undefined
  onDismiss: () => void
}) {
  const showAcceptChanges = useMemo(
    () => Boolean(true),
    [params]
    // () => Boolean(params && originalTrade && tradeMeaningfullyDiffers(trade, originalTrade)),
    //   [originalTrade, trade]
  )

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
        allowedSlippage={allowedSlippage}
        calculatedMintFee={calculatedMintFee}
      />
    ) : null
  }, [allowedSlippage, onConfirm, showAcceptChanges, deployErrorMessage, params, calculatedMintFee])

  // text to show while loading
  // const pendingText = `Swapping ${trade?.inputAmount?.toSignificant(6)} ${
  //   trade?.inputAmount?.currency?.symbol
  // } for ${trade?.outputAmount?.toSignificant(6)} ${trade?.outputAmount?.currency?.symbol}`
  const pendingText = 'Creating Token...'

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
          // bottomContent={falsey}
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
