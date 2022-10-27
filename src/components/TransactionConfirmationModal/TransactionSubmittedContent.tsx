import { ChainId } from '../../custom_modules/@filterswap-libs/sdk'
import React, { useContext } from 'react'
import { ThemeContext } from 'styled-components'
import { Button, LinkExternal, MetamaskIcon, Text } from '../../custom_modules/@filterswap-libs/uikit'
import { ArrowUpCircle } from 'react-feather'
import { AutoColumn } from '../Column'
import { getBscScanLink } from '../../utils'
import { Wrapper, Section, ConfirmedIcon, ContentHeader } from './helpers'
import { useActiveWeb3React } from '../../hooks/index'
import { useDeployState } from 'state/deploy/hooks'

type TransactionSubmittedContentProps = {
  onDismiss: () => void
  hash: string | undefined
  chainId: ChainId
}

const TransactionSubmittedContent = ({ onDismiss, chainId, hash }: TransactionSubmittedContentProps) => {
  const theme = useContext(ThemeContext)
  const { library, account } = useActiveWeb3React()
  const { params, newTokenAddress } = useDeployState()

  const AddTokenButton = () => {
    const addToken: () => void = async () => {
      if (account && library && library.provider && library.provider) {
        const wasAdded = await window.ethereum?.request({
          method: 'wallet_watchAsset',
          params: {
            type: 'ERC20',
            options: {
              address: newTokenAddress,
              symbol: params.tokenSymbol,
              decimals: 18,
              image: '',
            },
          },
        })
      }
    }

    return (
      <Button endIcon={window.ethereum?.isMetaMask ? <MetamaskIcon /> : ''} onClick={addToken}>{`Add ${
        params.tokenSymbol || 'Token'
      } to Wallet `}</Button>
    )
  }

  return (
    <Wrapper>
      <Section>
        <ContentHeader onDismiss={onDismiss}>Transaction submitted</ContentHeader>
        <ConfirmedIcon>
          <ArrowUpCircle strokeWidth={0.5} size={97} color={theme.colors.primary} />
        </ConfirmedIcon>
        <AutoColumn gap="8px" justify="center">
          {chainId && hash && (
            <>
              {newTokenAddress ? (
                <>
                  <Text color="primary" fontSize="24px">{`${params.tokenSymbol} has been deployed!`}</Text>
                  <Text color="textSubtle" fontSize="12px">{`Token address: ${newTokenAddress}`}</Text>
                  <br />
                  <AddTokenButton />
                  <br />
                </>
              ) : (
                ''
              )}
              <LinkExternal href={getBscScanLink(chainId, hash, 'transaction')}>View on BscScan</LinkExternal>
            </>
          )}
          <Button onClick={onDismiss} mt="20px">
            Close
          </Button>
        </AutoColumn>
      </Section>
    </Wrapper>
  )
}

export default TransactionSubmittedContent
