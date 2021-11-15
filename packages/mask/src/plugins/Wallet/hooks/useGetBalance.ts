import { WalletRPC } from '../messages'
import { useAsyncRetry } from 'react-use'
import { useChainId } from '@masknet/web3-shared-evm'

export function useGetBalance(address: string, contract_address?: string) {
    const chainId = useChainId()
    return useAsyncRetry(async () => {
        if (!contract_address) return
        return WalletRPC.getBalance(address, contract_address, chainId)
    }, [address, contract_address, chainId])
}
