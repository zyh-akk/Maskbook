import { WalletRPC } from '../messages'
import { useAsyncRetry } from 'react-use'

export function useGetAssets(account: string, disabled = false) {
    return useAsyncRetry(async () => {
        if (!account || disabled) return null
        return WalletRPC.getAssets(account)
    }, [account, disabled])
}
