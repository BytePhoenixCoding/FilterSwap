import { Trade } from '../../custom_modules/@filterswap-libs/sdk/dist'
import { Currency } from '../../custom_modules/@filterswap-libs/sdk'
import { useCallback, useMemo } from 'react'
import TransactionConfirmationModal, {
  ConfirmationModalContent,
  TransactionErrorContent,
} from '../TransactionConfirmationModal'
import DeployModalHeader from './DeployModalHeader'
import DeployModalFooter from './DeployModalFooter'
import { useDeployState } from 'state/deploy/hooks'

export default function ConfirmDeployModal({
  onAcceptChanges,
  onConfirm,
  onDismiss,
  deployErrorMessage,
  isOpen,
  attemptingTxn,
  txHash,
}: {
  isOpen: boolean
  attemptingTxn: boolean
  txHash: string | undefined
  onAcceptChanges: () => void
  onConfirm: () => void
  deployErrorMessage: string | undefined
  onDismiss: () => void
}) {
  const { params } = useDeployState()
  const showAcceptChanges = useMemo(() => Boolean(true), [params])

  const modalHeader = useCallback(() => {
    // return trade ? (
    //   <DeployModalHeader
    //     trade={trade}
    //     allowedSlippage={allowedSlippage}
    //     recipient={recipient}
    //     showAcceptChanges={showAcceptChanges}
    //     onAcceptChanges={onAcceptChanges}
    //   />
    // ) : null
  }, [onAcceptChanges, showAcceptChanges])

  const modalBottom = useCallback(() => {
    return params ? (
      <DeployModalFooter onConfirm={onConfirm} disabledConfirm={false} deployErrorMessage={deployErrorMessage} />
    ) : null
  }, [onConfirm, showAcceptChanges, deployErrorMessage, params])

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
