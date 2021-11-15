import {
    ChainId,
    createERC721ContractDetailed,
    createERC721Token,
    ERC721TokenDetailed,
    isSameAddress,
} from '@masknet/web3-shared-evm'
import urlcat from 'urlcat'
import { OPENSEA_API_KEY } from '../constants'

interface AssetContract {
    address: string
    asset_contract_type: string
    created_date: string
    name: string
    nft_version: string
    opensea_version: unknown | null
    owner: unknown | null
    schema_name: 'ERC721' | 'ERC1155'
    symbol: string
    total_supply: string
    description: string | null
    external_link: string | null
    image_url: string | null
    default_to_fiat: boolean
    dev_buyer_fee_basis_points: number
    dev_seller_fee_basis_points: number
    only_proxied_transfers: boolean
    opensea_buyer_fee_basis_points: number
    opensea_seller_fee_basis_points: number
    buyer_fee_basis_points: number
    seller_fee_basis_points: number
    payout_address: string | null
}

interface AssetOwner {
    user: {
        username: string | null
    }
    profile_img_url: string | null
    address: string | null
    config: string | null
    discord_id: string | null
}

interface AssetCollection {
    banner_image_url: string | null
    chat_url: string | null
    created_date: string
    default_to_fiat: boolean
    description: string | null
    dev_buyer_fee_basis_points: string
    dev_seller_fee_basis_points: string
    discord_url: string | null
    display_data: {
        card_display_style: 'contain' | 'padded'
        images: unknown[]
    }
    external_url: string | null
    featured: boolean
    featured_image_url: string | null
    hidden: boolean
    safelist_request_status: 'not_requested' | 'verified'
    image_url: string | null
    is_subject_to_whitelist: boolean
    large_image_url: string | null
    medium_username: string | null
    name: string
    only_proxied_transfers: boolean
    opensea_buyer_fee_basis_points: string
    opensea_seller_fee_basis_points: string
    payout_address: string | null
    require_email: boolean
    short_description: string | null
    slug: string
    telegram_url: string | null
    twitter_username: string | null
    instagram_username: string | null
    wiki_url: string | null
}

interface AssetCreator {
    user: {
        username: string | null
    }
    profile_img_url: string
    address: string
    config: string
    discord_id: string
}

export interface Asset {
    id: number
    token_id: string
    num_sales: number
    background_color: string | null
    image_url: string | null
    image_preview_url: string | null
    image_thumbnail_url: string | null
    image_original_url: string | null
    animation_url: string | null
    animation_original_url: string | null
    name: string
    description: string
    external_link: string
    asset_contract: AssetContract
    owner: AssetOwner
    permalink: string
    collection: AssetCollection
    decimals: number
    sell_orders: unknown[]
    creator: AssetCreator
    traits: unknown[]
    last_sale: unknown | null
    top_bid: unknown | null
    listing_date: unknown | null
    is_presale: boolean
    transfer_fee_payment_token: unknown | null
    transfer_fee: unknown | null
}

export interface AssetsListResponse {
    assets: Asset[]
}

async function fetchAsset(url: string, chainId: ChainId) {
    if (![ChainId.Mainnet, ChainId.Rinkeby].includes(chainId)) return

    const response = await fetch(url, {
        method: 'GET',
        mode: 'cors',
        headers: {
            'x-api-key': OPENSEA_API_KEY,
        },
    })

    const json = await response.json()
    return json
}

export async function getAssetsPaged(from: string, opts: { chainId?: ChainId; page?: number; size?: number }) {
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

    return asset.assets.map((asset: Asset) => createERC721TokenAsset(from, asset.token_id, chainId, asset))
}

function createERC721ContractDetailedFromAssetContract(
    address: string,
    chainId: ChainId,
    assetContract?: AssetContract,
) {
    return createERC721ContractDetailed(
        chainId,
        address,
        assetContract?.name ?? 'unknown name',
        assetContract?.symbol ?? 'unknown symbol',
    )
}

function createERC721TokenAsset(address: string, tokenId: string, chainId: ChainId, asset?: Asset) {
    return createERC721Token(
        createERC721ContractDetailed(
            chainId,
            address,
            asset?.asset_contract.name ?? 'unknown name',
            asset?.asset_contract.symbol ?? 'unknown symbol',
        ),
        {
            name: asset?.name ?? asset?.asset_contract.name ?? 'unknown name',
            description: asset?.description ?? asset?.asset_contract.symbol ?? 'unknown symbol',
            image:
                asset?.image_original_url ||
                asset?.image_url ||
                asset?.image_preview_url ||
                asset?.asset_contract.image_url ||
                '',
            owner: asset?.owner.address ?? '',
        },
        tokenId,
    )
}

export async function getContract(address: string, chainId = ChainId.Mainnet) {
    const assetContract = await fetchAsset(
        `https://${chainId === ChainId.Mainnet ? 'api' : 'rinkeby-api'}.opensea.io/api/v1/asset_contract?${address}`,
        chainId,
    )

    return createERC721ContractDetailedFromAssetContract(address, chainId, assetContract as unknown as AssetContract)
}

export async function getAsset(address: string, tokenId: string, chainId: ChainId) {
    const asset = await fetchAsset(
        urlcat(
            `https://${chainId === ChainId.Mainnet ? 'api' : 'rinkeby-api'}.opensea.io/api/v1/asset?/:address/:tokenId`,
            { address, tokenId },
        ),
        chainId,
    )

    return createERC721TokenAsset(address, tokenId, chainId, asset as Asset)
}

export async function getAssets(from: string, chainId: ChainId) {
    let tokens: ERC721TokenDetailed[] = []
    let page = 0
    let assets
    const size = 50
    do {
        assets = await getAssetsPaged(from, { chainId, page, size })
        tokens = tokens.concat(assets)
        page = page + 1
    } while (assets.length === size)

    return tokens
}

export async function GetContractBalance(address: string, contract_address: string, chainId: ChainId) {
    const assets = await getAssets(address, chainId)

    return assets.filter((x) => isSameAddress(x.contractDetailed.address, contract_address)).length
}
