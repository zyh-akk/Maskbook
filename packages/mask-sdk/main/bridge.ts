import { createMaskSDKChannel, BridgeAPI, UserScriptAPI, serializer, InitInformation } from '../shared'
import { AsyncCall } from 'async-call-rpc/base.min'

export const ethOnEvent = new Set<(event: string, ...args: any[]) => void>()
const self: UserScriptAPI = {
    request_init: null!,
    async eth_onEvent(...args) {
        ethOnEvent.forEach((x) => x(...args))
    },
}
export const readyPromise = new Promise<InitInformation>((resolve) => {
    self.request_init = async (init) => resolve(init)
})
export const contentScript: BridgeAPI = AsyncCall<BridgeAPI>(self, {
    channel: createMaskSDKChannel('user'),
    serializer,
})
