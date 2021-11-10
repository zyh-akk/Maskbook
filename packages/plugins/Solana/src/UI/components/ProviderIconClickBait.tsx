import { useCallback, cloneElement, isValidElement } from 'react'
import type { Plugin } from '@masknet/plugin-infra/src'
import { useWallet } from '@solana/wallet-adapter-react'
import { WalletName } from '@solana/wallet-adapter-wallets'
import type { NetworkType, ProviderType } from '@masknet/web3-shared-solana'

export interface ProviderIconClickBaitProps {
    network: Plugin.Shared.Network
    provider: Plugin.Shared.Provider
    children?: React.ReactNode
}

export function ProviderIconClickBait({ network, provider, children }: ProviderIconClickBaitProps) {
    debugger
    const wallet = useWallet()
    const { connected, disconnected, connecting, connect, select, wallets, publicKey } = wallet
    const networkType = network.type as NetworkType
    const providerType = provider.type as ProviderType

    const onClick = useCallback(async () => {
        console.log('bait click', wallet)
        debugger
        select(WalletName.Sollet)
        await connect()
    }, [networkType, providerType, select, connect, wallet])

    return (
        <>
            {isValidElement<object>(children)
                ? cloneElement(children, {
                      ...children.props,
                      onClick,
                  })
                : children}
        </>
    )
}
