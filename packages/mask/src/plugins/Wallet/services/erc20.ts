import Fuse from 'fuse.js'
import { EthereumAddress } from 'wallet.ts'
import { ERC20TokenDetailed, EthereumTokenType, isSameAddress } from '@masknet/web3-shared-evm'
import { createTransaction } from '../../../../background/database/utils/openDB'
import { createWalletDBAccess } from '../database/Wallet.db'
import { ERC20TokenRecordOutDB } from './helpers'
import type { ERC20TokenRecord } from '../database/types'
import { queryTransactionPaged } from '../../../database/helpers/pagination'

/** @deprecated */
export async function getERC20TokensCount() {
    const t = createTransaction(await createWalletDBAccess(), 'readonly')('ERC20Token', 'Wallet')
    return t.objectStore('ERC20Token').count()
}

/** @deprecated */
export async function getERC20Tokens() {
    const t = createTransaction(await createWalletDBAccess(), 'readonly')('ERC20Token', 'Wallet')
    const tokens = await t.objectStore('ERC20Token').getAll()
    return tokens.map(ERC20TokenRecordOutDB).map(
        (x): ERC20TokenDetailed => ({
            type: EthereumTokenType.ERC20,
            ...x,
        }),
    )
}

const fuse = new Fuse([] as ERC20TokenRecord[], {
    shouldSort: true,
    threshold: 0.45,
    minMatchCharLength: 1,
    keys: [
        { name: 'name', weight: 0.8 },
        { name: 'symbol', weight: 0.2 },
    ],
})

/** @deprecated */
export async function getERC20TokensPaged(index: number, count: number, query?: string) {
    const t = createTransaction(await createWalletDBAccess(), 'readonly')('ERC20Token')
    const tokens = await queryTransactionPaged(t, 'ERC20Token', {
        skip: index * count,
        count,
        predicate: (record) => {
            if (!query) return true
            if (EthereumAddress.isValid(query) && !isSameAddress(query, record.address)) return false
            fuse.setCollection([record])
            return !!fuse.search(query).length
        },
    })
    return tokens.map(ERC20TokenRecordOutDB).map(
        (x): ERC20TokenDetailed => ({
            type: EthereumTokenType.ERC20,
            ...x,
        }),
    )
}
