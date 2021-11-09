import { contentScript, ethOnEvent } from './bridge'

export class Ethereum implements Mask.Ethereum.Provider, Mask.Ethereum.ExperimentalProvider {
    constructor() {
        ethOnEvent.add((event, ...args) => {
            this.#getEventStore(event).forEach((f) => {
                try {
                    f(...args)
                } catch (error) {
                    console.error(error)
                }
            })
        })
    }
    #store = new Map<any, Set<Function>>()
    #getEventStore(name: string) {
        if (this.#store.has(name)) return this.#store.get(name)!
        this.#store.set(name, new Set())
        return this.#store.get(name)!
    }
    on(eventName: any, listener: Function): this {
        this.#getEventStore(eventName).add(listener)
        return this
    }
    removeListener(eventName: any, listener: Function): this {
        this.#getEventStore(eventName).delete(listener)
        return this
    }
    async request(args: Mask.Ethereum.RequestArguments): Promise<unknown> {
        return contentScript.eth_sendRequest(args)
    }
    sendAsync(request: any, callback: any): void {
        console.warn('EIP-1193 has deprecated sendAsync function. Use request instead.')
        contentScript.eth_sendRequest(request).then(callback)
    }
    send(...args: unknown[]): unknown {
        throw new Error('EIP-1193 has deprecated send function.')
    }
}
