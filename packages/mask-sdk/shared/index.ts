export interface BridgeAPI {
    persona_sign_web3(message: string): Promise<string>
    sns_appendComposition(message: string, metadata?: ReadonlyMap<string, unknown>): Promise<void>
    eth_sendRequest(url: string, message: any): Promise<any>
}
export interface UserScriptAPI {
    // When User script loaded, content script is not loaded. We must _be_ called to make sure CS has loaded.
    request_init(init: InitInformation): Promise<void>
    eth_onEvent(name: string, ...arg: any[]): Promise<void>
}
export interface InitInformation {
    SNSContext: {
        meta: Mask.SocialNetwork['metadata']
        connected: boolean
    }
}
export { serializer } from './serializer'
export { createMaskSDKChannel } from './channel'
