import {
    ERC721ContractDetailed,
    EthereumTokenType,
    ChainId,
    ERC721TokenDetailed,
    createERC721Token,
    createERC721ContractDetailed,
    formatEthereumAddress,
    isSameAddress,
} from '@masknet/web3-shared-evm'
const NFTSCAN_TOKEN_ID = 'bcaa7c6850d2489e8cb0247e0abdce50'
const CORS_PROXY = 'https://whispering-harbor-49523.herokuapp.com'
const BASE_API = 'https://api.nftscan.com/api/v1'

interface NFTAsset {
    last_price: string
    nft_asset_id: string
    nft_content_uri: string
    nft_cover: string
    nft_create_hash: string
    nft_create_time: string
    nft_creator: string
    nft_detail: string
    nft_holder: string
    nft_json: string
    nft_value: string
    token_id: string

    trade_contract: string
    trade_symbol: string
    trade_decimal: string
}

function createERC721ContractDetailedFromAssetContract(asset: NFTAsset) {
    return createERC721ContractDetailed(
        ChainId.Mainnet,
        asset.trade_contract,
        'unknown name',
        asset.trade_symbol ?? 'unknown symbol',
    )
}

function createERC721TokenAsset(asset: NFTAsset) {
    const json = JSON.parse(asset.nft_json)
    return createERC721Token(
        createERC721ContractDetailedFromAssetContract(asset),
        {
            name: json.name ?? 'unknown name',
            description: json.description ?? 'unknown symbol',
            image: json.image || '',
            owner: asset.nft_holder ?? '',
        },
        asset.token_id,
    )
}

async function getContractsAndBalance(address: string) {
    const response = await fetch(`${CORS_PROXY}/${BASE_API}/getGroupByNftContract`, {
        headers: {
            'content-type': 'application/json',
            Authorization: NFTSCAN_TOKEN_ID,
        },
        method: 'POST',
        body: JSON.stringify({
            erc: 'erc721',
            user_address: address,
        }),
    })

    if (!response.ok) return null

    type NFTContractResponse = {
        nft_asset: NFTAsset[]
        nft_asset_count: number
        nft_contract_address: string
        nft_platform_name: string
    }

    const { data }: { data: NFTContractResponse[] } = await response.json()

    return data
        .map((x) => {
            const contractDetailed: ERC721ContractDetailed = {
                name: x.nft_platform_name,
                symbol: '',
                address: x.nft_contract_address,
                chainId: ChainId.Mainnet,
                type: EthereumTokenType.ERC721,
            }
            const balance = x.nft_asset.length

            return {
                contractDetailed,
                balance,
            }
        })
        .sort((a, b) => a.balance - b.balance)
}

export async function findAssets(address: string) {
    const response = await fetch(`${CORS_PROXY}/${BASE_API}/${address}/findAssets`, {
        headers: {
            'content-type': 'application/json',
            Authorization: NFTSCAN_TOKEN_ID,
        },
    })

    if (!response.ok) return null

    type NFT_Assets = {
        nft_platform_list: {
            nft_platform_contract: string
            nft_platform_name: string
            nft_list: {
                nft_creator: string
            }[]
        }[]
    }

    const { data }: { data: NFT_Assets | null } = await response.json()

    return data?.nft_platform_list
        ? data.nft_platform_list
              .map((value) => {
                  const contractDetailed: ERC721ContractDetailed = {
                      name: value.nft_platform_name,
                      symbol: '',
                      address: formatEthereumAddress(value.nft_platform_contract),
                      type: EthereumTokenType.ERC721,
                      chainId: ChainId.Mainnet,
                  }

                  const balance = value.nft_list.length

                  return {
                      contractDetailed,
                      balance,
                  }
              })
              .sort((a, b) => b.balance - a.balance)
        : null
}

export async function getAsset(address: string, tokenId: string, chainId = ChainId.Mainnet) {
    const response = await fetch(`${CORS_PROXY}/${BASE_API}/getSingleNft`, {
        method: 'POST',
        headers: {
            'content-type': 'application/json',
            Authorization: NFTSCAN_TOKEN_ID,
        },
        body: JSON.stringify({
            nft_address: address,
            token_id: tokenId,
        }),
    })
    if (!response.ok) return
    const { data }: { data: NFTAsset } = await response.json()

    return createERC721TokenAsset(data)
}

export async function getAssets(from: string, chainId = ChainId.Mainnet) {
    let tokens: ERC721TokenDetailed[] = []
    let page = 0
    let assets
    const size = 50
    do {
        assets = await getAssetsPaged(from, { chainId, page, size })
        if (!assets) return []
        tokens = tokens.concat(assets)
        page = page + 1
    } while (assets.length === size)

    return tokens
}

export async function getAssetsPaged(from: string, opts: { chainId: ChainId; page?: number; size?: number }) {
    const { size = 50, page = 0 } = opts
    const response = await fetch(`${CORS_PROXY}/${BASE_API}/getAllNftByUserAddress`, {
        method: 'POST',
        headers: {
            'content-type': 'application/json',
            Authorization: NFTSCAN_TOKEN_ID,
        },
        body: JSON.stringify({
            page_size: size,
            page_index: page,
            use_address: from,
            erc: 'erc721',
        }),
    })

    if (!response.ok) return []

    const { data }: { data: { content: NFTAsset[]; page_index: number; page_size: number; total: number } } =
        await response.json()

    return data.content.map((asset) => createERC721TokenAsset(asset))
}

export async function GetContractBalance(address: string, contract_address: string, chainId: ChainId) {
    const response = await getContractsAndBalance(address)
    if (!response) return

    return response.find((x) => isSameAddress(x.contractDetailed.address, contract_address))?.balance
}
