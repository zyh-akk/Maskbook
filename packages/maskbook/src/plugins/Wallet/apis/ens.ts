import stringify from 'json-stable-stringify'

async function fetchDataFromSubgraph<T>(url: string, query: string) {
    const response = await fetch(url, {
        method: 'POST',
        mode: 'cors',
        body: stringify({ query }),
    })
    const { data } = (await response.json()) as {
        data: T
    }
    return data
}

export async function fetchNodeFromTwitterHandle(handle: string) {
    const data = await fetchDataFromSubgraph<{
        twitterHandle: {
            domains: {
                id: string
                owner: string
            }[]
        }
    }>(
        'https://api.thegraph.com/subgraphs/name/dimensiondev/ens-text-resolver-subgraph',
        `
        query twitterHandles {
            twitterHandle(where: { id: "${handle}" }) {
                domains {
                    id
                    owner
                }
            }
        }
    `,
    )
    if (!data?.twitterHandle.domains.length) return
    return data.twitterHandle.domains
}
