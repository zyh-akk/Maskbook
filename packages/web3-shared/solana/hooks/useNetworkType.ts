import { useCurrentUser } from './useCurrentUser'
import { NetworkType } from '../types'

export function useNetworkType() {
    const currentUser = useCurrentUser()
    return currentUser ? NetworkType.Solana : null
}
