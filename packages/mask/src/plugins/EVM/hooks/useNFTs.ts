import { useAsyncRetry } from 'react-use'
import { PluginEVMRPC } from '../messages'

export function useNFTs(account: string, disabled = false) {
    return useAsyncRetry(async () => {
        if (!account || disabled) return null
        return PluginEVMRPC.getNFTs(account)
    }, [account, disabled])
}
