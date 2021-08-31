import { useAsync } from 'react-use'
import { WalletRPC } from '../messages'

export function useDomainFromTwitterHandle(handle: string) {
    return useAsync(async () => {
        return WalletRPC.fetchDomainFromTwitterHandle(handle)
    }, [handle])
}
