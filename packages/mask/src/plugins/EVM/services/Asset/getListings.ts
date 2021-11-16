import { CollectibleProvider } from '@masknet/web3-shared-evm'
import { currentChainIdSettings, currentCollectibleDataProviderSettings } from '../../../Wallet/settings'
import * as OpenSeaApi from '../../apis/opensea'
import * as RaribleApi from '../../apis/rarible'
import * as NFTScanApi from '../../apis/nftscan'
import { unreachable } from '@dimensiondev/kit'

export async function getListings(address: string, tokenId: string, chainId = currentChainIdSettings.value) {
    const provider = currentCollectibleDataProviderSettings.value
    let asset
    switch (provider) {
        case CollectibleProvider.OPENSEA:
            asset = await OpenSeaApi.getListings(address, tokenId, chainId)
            return asset
        case CollectibleProvider.NFTSCAN:
            asset = await NFTScanApi.getListings(address, tokenId, chainId)
            return asset
        case CollectibleProvider.RARIBLE:
            asset = await RaribleApi.getListings(address, tokenId, chainId)
            return asset
        default:
            unreachable(provider)
    }
}
