import { CollectibleProvider } from '@masknet/web3-shared-evm'
import { currentChainIdSettings, currentCollectibleDataProviderSettings } from '../../../Wallet/settings'
import * as OpenSeaApi from '../../apis/opensea'
import * as RaribleApi from '../../apis/rarible'
import * as NFTScanApi from '../../apis/nftscan'
import { unreachable } from '@dimensiondev/kit'

export async function getOrder(address: string, tokenId: string, side: number, chainId = currentChainIdSettings.value) {
    const provider = currentCollectibleDataProviderSettings.value
    let asset
    switch (provider) {
        case CollectibleProvider.OPENSEA:
            asset = await OpenSeaApi.getOrder(address, tokenId, side, chainId)
            return asset
        case CollectibleProvider.NFTSCAN:
            asset = await NFTScanApi.getOrder(address, tokenId, chainId, chainId)
            return asset
        case CollectibleProvider.RARIBLE:
            asset = await RaribleApi.getOrder(address, tokenId, chainId, chainId)
            return asset
        default:
            unreachable(provider)
    }
}
