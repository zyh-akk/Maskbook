import * as OpenSeaApi from '../../apis/opensea'
import * as NFTScanApi from '../../apis/nftscan'
import * as RaribleApi from '../../apis/rarible'
import { unreachable } from '@dimensiondev/kit'
import { ChainId, CollectibleProvider } from '@masknet/web3-shared-evm'
import { currentCollectibleDataProviderSettings } from '../../../Wallet/settings'

export async function getNFTsPaged(from: string, chainId: ChainId, page?: number, size?: number) {
    const provider = currentCollectibleDataProviderSettings.value
    let assets
    switch (provider) {
        case CollectibleProvider.OPENSEA:
            assets = await OpenSeaApi.getNFTsPaged(from, { chainId, page, size })
            return assets
        case CollectibleProvider.NFTSCAN:
            assets = await NFTScanApi.getNFTsPaged(from, { chainId, page, size })
            return assets
        case CollectibleProvider.RARIBLE:
            assets = await RaribleApi.getNFTsPaged(from, { chainId, page, size })
            return assets
        default:
            unreachable(provider)
    }
}
