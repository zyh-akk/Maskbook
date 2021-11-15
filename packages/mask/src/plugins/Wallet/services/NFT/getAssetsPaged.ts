import * as OpenSeaApi from '../../apis/opensea'
import * as NFTScanApi from '../../apis/nftscan'
import { unreachable } from '@dimensiondev/kit'
import { currentCollectibleDataProviderSettings } from '../../settings'
import { ChainId, CollectibleProvider } from '@masknet/web3-shared-evm'

export async function getAssetsPaged(from: string, chainId: ChainId, page?: number, size?: number) {
    const provider = currentCollectibleDataProviderSettings.value
    let assets
    switch (provider) {
        case CollectibleProvider.OPENSEA:
            assets = await OpenSeaApi.getAssetsPaged(from, { chainId, page, size })
            return assets
        case CollectibleProvider.NFTSCAN:
            assets = await NFTScanApi.getAssetsPaged(from, { chainId, page, size })
            return assets
        default:
            unreachable(provider)
    }
}
