import * as OpenSeaApi from '../../apis/opensea'
import * as NFTScanApi from '../../apis/nftscan'
import { unreachable } from '@dimensiondev/kit'
import { CollectibleProvider } from '@masknet/web3-shared-evm'
import { currentChainIdSettings, currentCollectibleDataProviderSettings } from '../../settings'
import { TokenTab } from '../../../Collectible/SNSAdaptor/TokenTab'

export async function getAsset(address: string, tokenId: string, chainId = currentChainIdSettings.value) {
    const provider = currentCollectibleDataProviderSettings.value
    let token
    switch (provider) {
        case CollectibleProvider.OPENSEA:
            token = await OpenSeaApi.getAsset(address, tokenId, chainId)
            return token
        case CollectibleProvider.NFTSCAN:
            token = await NFTScanApi.getAsset(address, tokenId)
            return TokenTab
        default:
            unreachable(provider)
    }
}
