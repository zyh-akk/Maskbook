import { createLookupTableResolver } from '@masknet/web3-kit'
import { ChainId, ProviderType } from '../types'

export const resolveChainName = createLookupTableResolver<ChainId, string>(
    {
        [ChainId.MainnetBeta]: 'mainnet-beta',
        [ChainId.Testnet]: 'testnet',
        [ChainId.Devenet]: 'devnet',
    },
    () => 'Unknown chain id',
)

export const resolveProviderName = createLookupTableResolver<ProviderType, string>(
    {
        [ProviderType.Phantom]: 'Phantom',
    },
    () => 'Unknown provider type',
)

export const resolveLinkOnExplorer = createLookupTableResolver<ChainId, string>(
    {
        [ChainId.MainnetBeta]: 'https://explorer.solana.com/',
        [ChainId.Testnet]: 'https://explorer.solana.com/?cluster=testnet',
        [ChainId.Devnet]: 'https://explorer.solana.com/?cluster=devnet',
    },
    () => 'Unknown chain id',
)

// todo: https://flowscan.org/
export function resolveTransactionLinkOnExplorer(chainId: ChainId, tx: string) {
    return ''
}

// todo: https://flowscan.org/
export function resolveAccountLinkOnExplorer(chainId: ChainId, address: string) {
    return ''
}
