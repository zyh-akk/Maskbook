import { ChainId, CollectibleProvider } from '@masknet/web3-shared-evm'
import { currentCollectibleDataProviderSettings } from '../../settings'
import * as OpenSeaApi from '../../apis/opensea'
import * as NFTScanApi from '../../apis/nftscan'
import { unreachable } from '@dimensiondev/kit'

export async function getBalance(address: string, contract_address: string, chainId: ChainId) {
    const provider = currentCollectibleDataProviderSettings.value
    let balance
    switch (provider) {
        case CollectibleProvider.OPENSEA:
            balance = await OpenSeaApi.GetContractBalance(address, contract_address, chainId)
            return balance
        case CollectibleProvider.NFTSCAN:
            balance = await NFTScanApi.GetContractBalance(address, contract_address, chainId)
            return balance
        default:
            unreachable(provider)
    }
}
