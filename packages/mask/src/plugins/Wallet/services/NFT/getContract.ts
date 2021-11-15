import { unreachable } from '@dimensiondev/kit'
import { CollectibleProvider } from '@masknet/web3-shared-evm'
import * as OpenSeaApi from '../../apis/opensea'
import { currentChainIdSettings, currentCollectibleDataProviderSettings } from '../../settings'

export async function getContract(contractAddress: string, chainId = currentChainIdSettings.value) {
    const provider = currentCollectibleDataProviderSettings.value
    switch (provider) {
        case CollectibleProvider.OPENSEA:
        case CollectibleProvider.NFTSCAN:
            const assetContract = await OpenSeaApi.getContract(contractAddress, chainId)
            return assetContract
        default:
            unreachable(provider)
    }
}
