import { useAsyncRetry } from 'react-use'
import { PluginEVMRPC } from '../messages'

export function useHistory(address?: string, tokenId?: string) {
    return useAsyncRetry(async () => {
        if (!address || !tokenId) return
        return PluginEVMRPC.getHistory(address, tokenId)
    }, [address, tokenId])
}
