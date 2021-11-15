import { currentChainIdSettings, currentCollectibleDataProviderSettings } from '../../settings'
import * as OpenSeaApi from '../../apis/opensea'
import * as NFTScanApi from '../../apis/nftscan'
import { unreachable } from '@dimensiondev/kit'
import { CollectibleProvider } from '@masknet/web3-shared-evm'

export async function getAssets(from: string, chainId = currentChainIdSettings.value) {
    const provider = currentCollectibleDataProviderSettings.value
    let tokens
    switch (provider) {
        case CollectibleProvider.OPENSEA:
            tokens = await OpenSeaApi.getAssets(from, chainId)
            return tokens
        case CollectibleProvider.NFTSCAN:
            tokens = await NFTScanApi.getAssets(from)
            return tokens
        default:
            unreachable(provider)
    }
}
