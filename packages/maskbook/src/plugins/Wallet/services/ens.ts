import { fetchDomainFromNode, fetchNodeFromTwitterHandle } from '../apis/ens'

export async function fetchDomainFromTwitterHandle(handle: string) {
    const node = await fetchNodeFromTwitterHandle(handle)
    if (!node) return
    const domain = await fetchDomainFromNode(node)
    return domain
}
