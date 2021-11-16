import { useChainId } from '@masknet/web3-shared-evm'
import { useAsyncRetry } from 'react-use'
import { PluginEVMRPC } from '../messages'
import { OrderSide } from '../types/NFT'

export function useOrders(address?: string, tokenId?: string, side?: OrderSide) {
    const chainId = useChainId()
    return useAsyncRetry(async () => {
        if (!address || !tokenId) return
        return PluginEVMRPC.getOrder(address, tokenId, side ?? OrderSide.Sell, chainId)
    }, [address, tokenId, side, chainId])
}
