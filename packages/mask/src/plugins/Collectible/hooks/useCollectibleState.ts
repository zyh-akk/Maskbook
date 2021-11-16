import { useRef, useState } from 'react'
import { createContainer } from 'unstated-next'
import { OrderSide } from 'opensea-js/lib/types'
import { useValueRef } from '@masknet/shared'
import { currentCollectibleProviderSettings } from '../settings'
import { CollectibleTab, CollectibleToken } from '../types'
import { useAsset, useHistory, useOrders } from '../../EVM/hooks'
import { useAssetOrder } from './useAssetOrder'

function useCollectibleState(token?: CollectibleToken) {
    const [tabIndex, setTabIndex] = useState(CollectibleTab.ARTICLE)

    const provider = useValueRef(currentCollectibleProviderSettings)
    const asset = useAsset(token?.contractAddress ?? '', token?.tokenId ?? '')

    //#region asset order from sdk
    const assetOrder = useAssetOrder(provider, token)
    //#endregion

    //#region offers
    const [offerPage, setOfferPage] = useState(0)
    const offers = useOrders(
        tabIndex === CollectibleTab.OFFER ? token?.contractAddress : undefined,
        tabIndex === CollectibleTab.OFFER ? token?.tokenId : undefined,
        OrderSide.Buy,
    )
    //#endregion

    //#region orders
    const [orderPage, setOrderPage] = useState(0)
    const orders = useOrders(
        tabIndex === CollectibleTab.LISTING ? token?.contractAddress : undefined,
        tabIndex === CollectibleTab.LISTING ? token?.tokenId : undefined,
        OrderSide.Sell,
    )
    //#endregion

    //#region events
    const [eventPage, setEventPage] = useState(0)
    const cursors = useRef<string[]>([])
    const events = useHistory(
        tabIndex === CollectibleTab.HISTORY ? token?.contractAddress : undefined,
        tabIndex === CollectibleTab.HISTORY ? token?.tokenId : undefined,
    )
    //#endregion

    return {
        token,
        asset,
        provider,

        assetOrder,

        tabIndex,
        setTabIndex,

        offers,
        offerPage,
        setOfferPage,

        orders,
        orderPage,
        setOrderPage,

        events,
        eventPage,
        setEventPage,
    }
}

export const CollectibleState = createContainer(useCollectibleState)
