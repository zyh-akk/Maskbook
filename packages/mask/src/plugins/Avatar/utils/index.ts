import BigNumber from 'bignumber.js'
import { isNull } from 'lodash-es'
import { ChainId } from '@masknet/web3-shared-evm'
import { PluginEVMRPC } from '../../EVM/messages'
import { getOrderUnitPrice } from '../../EVM/utils'

export async function getNFT(address: string, tokenId: string) {
    const asset = await PluginEVMRPC.getAsset(address, tokenId, ChainId.Mainnet)

    return {
        amount: new BigNumber(
            getOrderUnitPrice(
                asset?.desktopOrder?.current_price,
                asset?.desktopOrder?.payment_token_contract?.decimals ?? 0,
                asset?.desktopOrder?.quantity ?? '1',
            ) ?? 0,
        ).toFixed(),
        name: asset?.name ?? '',
        symbol: asset?.desktopOrder?.payment_token_contract?.symbol ?? 'ETH',
        image: asset?.image_url ?? '',
        owner: asset?.top_ownerships[0].owner.address ?? '',
    }
}

export async function createNFT(address: string, tokenId: string) {
    const nft = await PluginEVMRPC.getNFT(address, tokenId, ChainId.Mainnet)
    return nft
}

export function toPNG(image: string) {
    return new Promise<Blob | null>((resolve, reject) => {
        const img = new Image()
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        if (isNull(ctx)) throw new Error('Canvas was not supported')
        img.addEventListener('load', () => {
            ;[canvas.width, canvas.height] = [img.width, img.height]
            ctx.drawImage(img, 0, 0, img.width, img.height)
            canvas.toBlob((blob) => {
                resolve(blob)
            }, 'image/png')
        })
        img.addEventListener('error', () => {
            reject(new Error('Could not load image'))
        })
        img.setAttribute('CrossOrigin', 'Anonymous')
        img.src = image
    })
}
