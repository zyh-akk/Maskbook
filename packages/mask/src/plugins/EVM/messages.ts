import { PLUGIN_IDENTIFIER } from './constants'
import { createPluginMessage, createPluginRPC } from '@masknet/plugin-infra'

if (import.meta.webpackHot) import.meta.webpackHot.accept()
const PluginEVMMessage = createPluginMessage(PLUGIN_IDENTIFIER)
export const PluginEVMRPC = createPluginRPC(PLUGIN_IDENTIFIER, () => import('./services'), PluginEVMMessage.rpc)
