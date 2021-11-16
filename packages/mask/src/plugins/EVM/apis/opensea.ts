import {
    ChainId,
    createERC721ContractDetailed,
    createERC721Token,
    ERC721TokenDetailed,
    EthereumTokenType,
    isSameAddress,
} from '@masknet/web3-shared-evm'
import BigNumber from 'bignumber.js'
import { head, uniqBy } from 'lodash-es'
import urlcat from 'urlcat'
import type { AssetCollection, AssetOrder, NFTAsset, NFTHistory } from '../types/NFT'
import { getOrderUnitPrice, getOrderUSDPrice, toDate, toTokenDetailed } from '../utils'

const OpenSeaAccountURL = 'https://opensea.io/accounts/'
const OPENSEA_API_KEY = 'c38fe2446ee34f919436c32db480a2e3'

//#region opensea fetch response
export interface OpenSeaFees {
    opensea_seller_fee_basis_points: number
    opensea_buyer_fee_basis_points: number
    dev_seller_fee_basis_points: number
    dev_buyer_fee_basis_points: number
}

export interface Asset {
    token_id: string
    token_address: string
    schema_name?: string
    version?: string
    name?: string
    decimals?: number
}

export interface OpenSeaAssetContract extends OpenSeaFees {
    name: string
    address: string
    type: string
    schema_name: string
    seller_fee_basis_points: number
    buyer_fee_basis_points: number
    description: string
    token_symbol: string
    image_url: string
    stats?: object
    traits?: object[]
    external_link?: string
    wiki_link?: string
}

interface NumericalTraitStats {
    min: number
    max: number
}
interface StringTraitStats {
    [key: string]: number
}

interface OpenSeaTraitStats {
    [traitName: string]: NumericalTraitStats | StringTraitStats
}

interface OpenSeaFungibleToken {
    image_url?: string
    eth_price?: string
    usd_price?: string
    name: string
    symbol: string
    decimals: number
    address: string
}

interface OpenSeaCustomAccount {
    address: string
    profile_img_url: string
    user?: {
        username: string
    }
}

interface OpenSeaCollection extends OpenSeaFees {
    name: string
    slug: string
    editors: string[]
    hidden: boolean
    featured: boolean
    created_date: string
    description: string
    image_url: string
    largeImage_url: string
    featured_image_url: string
    stats: object
    display_data: object
    payment_tokens: OpenSeaFungibleToken[]
    payout_address?: string
    trait_stats: OpenSeaTraitStats
    external_link?: string
    wiki_link?: string
    safelist_request_status: string
}

interface OpenSeaResponse extends Asset {
    animation_url: string
    asset_contract: OpenSeaAssetContract
    collection: OpenSeaCollection
    name: string
    description: string
    owner: OpenSeaCustomAccount
    orders: AssetOrder[] | null
    buy_orders: AssetOrder[] | null
    sell_orders: AssetOrder[] | null
    is_presale: boolean
    image_url: string
    image_preview_url: string
    image_url_original: string
    image_url_thumbnail: string
    opensea_link: string
    external_link: string
    traits: {
        trait_type: string
        value: string
    }[]
    num_sales: number
    last_sale: AssetEvent | null
    background_color: string | null
    transfer_fee: string | null
    transfer_fee_payment_token: OpenSeaFungibleToken | null
    top_ownerships: {
        owner: OpenSeaCustomAccount
        quantity: string
    }[]
    creator: OpenSeaCustomAccount
    endTime: string
}

interface AssetEvent {
    event_type: string
    event_timestamp: number
    auction_type: string
    total_price: string
    transaction: Transaction | null
    payment_token: OpenSeaFungibleToken | null
}

interface Transaction {
    from_account: OpenSeaCustomAccount
    to_account: OpenSeaCustomAccount
    created_date: string
    modified_date: string
    transaction_hash: string
    transaction_index: string
    block_number: string
    block_hash: string
    timestamp: number
}

export interface OpenSeaAssetEvent {
    id: string
    event_type: string
    from_account?: OpenSeaCustomAccount
    to_account?: OpenSeaCustomAccount
    seller?: OpenSeaCustomAccount
    winner_account?: OpenSeaCustomAccount
    asset: {
        id: string
        decimals: number
        image_url: string
        image_original_url: string
        image_preview_url: string
        asset_contract: {
            symbol: string
        }
        permalink: string
    }
    payment_token: OpenSeaFungibleToken
    quantity: string
    ending_price: string
    bid_amount: string
    starting_price: string
    transaction: {
        blockExplorerLink: string
        id: string
    }
    assetQuantity: {
        asset: {
            decimals?: number
            id: string
        }
        quantity: string
        id: string
    }
    created_date: string
}

//#endregion
async function fetchAsset(url: string, chainId: ChainId) {
    if (![ChainId.Mainnet, ChainId.Rinkeby].includes(chainId)) return

    const response = await (
        await fetch(url, {
            method: 'GET',
            mode: 'cors',
            headers: {
                'x-api-key': OPENSEA_API_KEY,
            },
        })
    ).json()

    return response
}

export async function getNFTsPaged(from: string, opts: { chainId?: ChainId; page?: number; size?: number }) {
    const { chainId = ChainId.Mainnet, page = 0, size = 50 } = opts
    const params = new URLSearchParams()
    params.append('owner', from.toLowerCase())
    params.append('limit', String(size))
    params.append('offset', String(size * page))

    const asset = await fetchAsset(
        `https://${chainId === ChainId.Mainnet ? 'api' : 'rinkeby-api'}.opensea.io/api/v1/assets?${params.toString()}`,
        chainId,
    )
    if (!asset) return []

    return asset.assets.map((asset: OpenSeaResponse) => createERC721TokenAsset(from, asset.token_id, chainId, asset))
}

function createERC721ContractDetailedFromAssetContract(
    address: string,
    chainId: ChainId,
    assetContract?: OpenSeaAssetContract,
) {
    return createERC721ContractDetailed(chainId, address, assetContract?.name ?? 'unknown name', '')
}

function createERC721TokenAsset(address: string, tokenId: string, chainId: ChainId, asset?: OpenSeaResponse) {
    return createERC721Token(
        createERC721ContractDetailed(chainId, address, asset?.name ?? 'unknown name', ''),
        {
            name: asset?.name ?? asset?.asset_contract.name ?? 'unknown name',
            description: asset?.description ?? '',
            image: asset?.image_url_original ?? asset?.image_url ?? asset?.image_preview_url ?? '',
            owner: asset?.owner.address ?? '',
        },
        tokenId,
    )
}

async function _getAsset(address: string, tokenId: string, chainId: ChainId) {
    const asset = (await fetchAsset(
        urlcat(
            `https://${chainId === ChainId.Mainnet ? 'api' : 'rinkeby-api'}.opensea.io/api/v1/asset/:address/:tokenId`,
            { address, tokenId },
        ),
        chainId,
    )) as OpenSeaResponse
    return asset
}

export async function getContract(address: string, chainId = ChainId.Mainnet) {
    const assetContract = await fetchAsset(
        `https://${chainId === ChainId.Mainnet ? 'api' : 'rinkeby-api'}.opensea.io/api/v1/asset_contract/${address}`,
        chainId,
    )

    return createERC721ContractDetailedFromAssetContract(address, chainId, assetContract)
}

export async function getNFT(address: string, tokenId: string, chainId: ChainId) {
    const asset = await _getAsset(address, tokenId, chainId)
    return createERC721TokenAsset(address, tokenId, chainId, asset)
}

export async function getNFTs(from: string, chainId: ChainId) {
    let tokens: ERC721TokenDetailed[] = []
    let page = 0
    let assets
    const size = 50
    do {
        assets = await getNFTsPaged(from, { chainId, page, size })
        tokens = tokens.concat(assets)
        page = page + 1
    } while (assets.length === size)

    return tokens
}

export async function getContractBalance(address: string, contract_address: string, chainId: ChainId) {
    const assets = await getNFTs(address, chainId)

    return assets.filter((x) => isSameAddress(x.contractDetailed.address, contract_address)).length
}

function createNFTAsset(asset: OpenSeaResponse, chainId: ChainId) {
    const desktopOrder = head(
        asset.sell_orders?.sort((a, b) =>
            new BigNumber(getOrderUSDPrice(a.current_price, a.payment_token_contract?.usd_price) ?? 0)
                .minus(getOrderUSDPrice(a.current_price, a.payment_token_contract?.usd_price) ?? 0)
                .toNumber(),
        ),
    )

    return {
        is_verified: ['approved', 'verified'].includes(asset.collection?.safelist_request_status ?? ''),
        //      is_order_weth: isSameAddress(desktopOrder.payment_token ?? '', WNATIVE_ADDRESS),
        //      is_collection_weth: openSeaResponse.collection.payment_tokens.some(currySameAddress(WNATIVE_ADDRESS)),
        //  is_owner: asset.top_ownerships.some((item) => isSameAddress(item.owner.address, account)),
        // it's an IOS string as my inspection
        is_auction: Date.parse(`${asset.endTime ?? ''}Z`) > Date.now(),
        image_url: asset.image_url_original ?? asset.image_url ?? asset.image_preview_url ?? '',
        asset_contract: {
            name: asset.asset_contract.name,
            description: asset.asset_contract.description,
            schemaName: asset.asset_contract.schema_name,
        },
        current_price: desktopOrder
            ? new BigNumber(
                  getOrderUnitPrice(
                      desktopOrder.current_price,
                      desktopOrder.payment_token_contract?.decimals,
                      desktopOrder.quantity,
                  ) ?? 0,
              ).toNumber()
            : null,
        current_symbol: desktopOrder?.payment_token_contract?.symbol ?? 'ETH',
        owner: {
            ...asset.owner,
            link: `${OpenSeaAccountURL}${asset.owner?.user?.username ?? asset.owner.address ?? ''}`,
        },
        creator: {
            ...asset.creator,
            link: `${OpenSeaAccountURL}${asset.creator?.user?.username ?? asset.creator?.address ?? ''}`,
        },
        token_id: asset.token_id,
        token_address: asset.token_address,
        traits: asset.traits,
        safelist_request_status: asset.collection?.safelist_request_status ?? '',
        description: asset.description,
        name: asset.name ?? asset.collection.name,
        collection_name: asset.collection.name,
        animation_url: asset.animation_url,
        end_time: asset.endTime
            ? new Date(asset.endTime)
            : desktopOrder
            ? toDate(Number.parseInt(desktopOrder.listing_time as unknown as string, 10))
            : null,
        order_payment_tokens: desktopOrder?.payment_token_contract
            ? [toTokenDetailed(chainId, desktopOrder.payment_token_contract)]
            : [],
        offer_payment_tokens: uniqBy(
            asset.collection.payment_tokens.map((x) => toTokenDetailed(chainId, x)),
            (x) => x.address.toLowerCase(),
        ).filter((x) => x.type === EthereumTokenType.ERC20),
        slug: asset.collection.slug,
        desktopOrder,
        top_ownerships: asset.top_ownerships.map((x) => ({ owner: x.owner })),
        collection: asset.collection as unknown as AssetCollection,
        response_: asset as any,
    } as NFTAsset
}

export async function getAsset(address: string, tokenId: string, chainId: ChainId) {
    const asset = await _getAsset(address, tokenId, chainId)
    if (!asset) return

    return createNFTAsset(asset, chainId)
}

export async function getHistory(address: string, tokenId: string, chainId: ChainId) {
    const params = new URLSearchParams()
    params.append('asset_contract_address', address)
    params.append('token_id', tokenId)
    params.append('offset', '0')
    params.append('limit', '100')

    const fetchResponse = await (
        await fetch(
            `https://${
                chainId === ChainId.Mainnet ? 'api' : 'rinkeby-api'
            }.opensea.io/api/v1/events?${params.toString()}`,
            {
                mode: 'cors',
                headers: { 'x-api-key': OPENSEA_API_KEY },
            },
        )
    ).json()

    const { asset_events }: { asset_events: OpenSeaAssetEvent[] } = fetchResponse

    return asset_events.map((event) => createNFTHistory(event))
}

function createNFTHistory(event: OpenSeaAssetEvent): NFTHistory {
    const accountPair =
        event.event_type === 'successful'
            ? {
                  from: {
                      username: event.seller?.user?.username,
                      address: event.seller?.address,
                      imageUrl: event.seller?.profile_img_url,
                      link: `${OpenSeaAccountURL}${event.seller?.user?.username ?? event.seller?.address}`,
                  },
                  to: {
                      username: event.winner_account?.user?.username,
                      address: event.winner_account?.address,
                      imageUrl: event.winner_account?.profile_img_url,
                      link: `${OpenSeaAccountURL}${
                          event.winner_account?.user?.username ?? event.winner_account?.address
                      }`,
                  },
              }
            : {
                  from: {
                      username: event.from_account?.user?.username,
                      address: event.from_account?.address,
                      imageUrl: event.from_account?.profile_img_url,
                      link: `${OpenSeaAccountURL}${event.from_account?.user?.username ?? event.from_account?.address}`,
                  },
                  to: {
                      username: event.to_account?.user?.username,
                      address: event.to_account?.address,
                      imageUrl: event.to_account?.profile_img_url,
                      link: `${OpenSeaAccountURL}${event.to_account?.user?.username ?? event.to_account?.address}`,
                  },
              }
    return {
        id: event.id,
        accountPair,
        price: {
            quantity: event.quantity,
            asset: event.asset,
            paymentToken: event.payment_token,
            price: event.bid_amount ?? event.ending_price ?? event.starting_price,
        },
        eventType: event.event_type,
        transactionBlockExplorerLink: event.transaction?.blockExplorerLink,
        timestamp: new Date(`${event.created_date}Z`).getTime(),
    } as NFTHistory
}

export async function getListings(address: string, tokenId: string, chainId: ChainId) {
    return []
}

async function fetchOrder(
    address: string,
    tokenId: string,
    side: number,
    page: number,
    size: number,
    chainId: ChainId,
) {
    const params = new URLSearchParams()
    params.append('asset_contract_address', address)
    params.append('token_id', tokenId)
    params.append('side', side.toString())
    params.append('offset', page.toString())
    params.append('size', size.toString())
    const response = await (
        await fetch(`https://api.opensea.io/wyvern/v1/orders?${params.toString()}`, {
            method: 'GET',
            mode: 'cors',
            headers: {
                Accept: 'application/json',
                'x-api-key': OPENSEA_API_KEY,
            },
        })
    ).json()

    const { orders }: { orders: AssetOrder[] } = response
    return orders
}

export async function getOrder(address: string, tokenId: string, side: number, chainId: ChainId) {
    let orders: AssetOrder[] = []

    let page = 0
    const size = 50
    let order
    do {
        order = await fetchOrder(address, tokenId, side, size, page, chainId)
        orders = orders.concat(order ?? [])
        page = page + 1
    } while (order.length === size)

    return orders
}
