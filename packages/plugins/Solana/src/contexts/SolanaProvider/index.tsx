import { WalletAdapterNetwork } from '@solana/wallet-adapter-base'
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react'
import { getSolletWallet } from '@solana/wallet-adapter-wallets'
import { clusterApiUrl } from '@solana/web3.js'
import { FC, useMemo, useState } from 'react'

export const SolanaProvider: FC = ({ children }) => {
    const [network] = useState(WalletAdapterNetwork.Devnet)
    const endpoint = useMemo(() => clusterApiUrl(network), [network])

    const wallets = useMemo(() => [getSolletWallet({ network })], [network])
    console.log('solanaprovider')
    return (
        <ConnectionProvider endpoint={endpoint}>
            <WalletProvider wallets={wallets}>{children}</WalletProvider>
        </ConnectionProvider>
    )
}
