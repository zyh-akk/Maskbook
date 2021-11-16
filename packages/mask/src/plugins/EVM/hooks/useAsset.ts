import { useAsyncRetry } from 'react-use'
import { currySameAddress, isSameAddress, useAccount, useChainId, useTokenConstants } from '@masknet/web3-shared-evm'
import { PluginEVMRPC } from '../messages'

export function useAsset(address: string, token_id: string) {
    const account = useAccount()
    const chainId = useChainId()
    const { WNATIVE_ADDRESS } = useTokenConstants()

    return useAsyncRetry(async () => {
        console.log('----')
        console.log(address)
        console.log(token_id)
        const asset = await PluginEVMRPC.getAsset(address, token_id, chainId)
        console.log('-------------')
        console.log(asset)
        return {
            ...asset,
            is_order_weth: isSameAddress(asset?.desktopOrder?.payment_token ?? '', WNATIVE_ADDRESS) ?? false,
            is_collection_weth: asset?.collection?.payment_tokens?.some(currySameAddress(WNATIVE_ADDRESS)) ?? false,
            is_owner:
                asset?.top_ownerships.some((item: { owner: { address: string | undefined } }) =>
                    isSameAddress(item.owner.address, account),
                ) ?? false,
        }
    }, [account, chainId, WNATIVE_ADDRESS])
}
