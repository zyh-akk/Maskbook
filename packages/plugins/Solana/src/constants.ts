import type { Plugin } from '@masknet/plugin-infra'
import { NetworkType, ProviderType } from '@masknet/web3-shared-solana/types'

export const PLUGIN_META_KEY = 'com.maskbook.solana'
export const PLUGIN_ID = 'com.maskbook.solana'
export const PLUGIN_NAME = 'Solana'
export const PLUGIN_ICON = '🌅'
export const PLUGIN_DESCRIPTION = ''
export const PLUGIN_NETWORKS: Plugin.Shared.Network[] = [
    {
        ID: `${PLUGIN_ID}_solana`,
        pluginID: PLUGIN_ID,
        type: NetworkType.Solana,
        name: 'Solana',
        icon: new URL('./assets/solana.svg', import.meta.url).toString(),
    },
]
export const PLUGIN_PROVIDERS: Plugin.Shared.Provider[] = [
    {
        ID: `${PLUGIN_ID}_blocto`,
        pluginID: PLUGIN_ID,
        type: ProviderType.Phantom,
        name: 'Blocto',
        icon: new URL('./assets/phantom.png', import.meta.url).toString(),
    },
]
