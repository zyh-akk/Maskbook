import type { Account } from '@onflow/fcl'
import { useAsyncRetry } from 'react-use'
import { useFCL } from './useFCL'
import { useCurrentUser } from './useCurrentUser'

export function useAccount() {
    const fcl = useFCL()
    const currentUser = useCurrentUser()
    return useAsyncRetry(async () => {
        if (!currentUser?.addr) return null
        const { account } = await fcl.send([fcl.getAccount(currentUser.addr)])
        return account as Account
    }, [currentUser?.addr, fcl])
}
