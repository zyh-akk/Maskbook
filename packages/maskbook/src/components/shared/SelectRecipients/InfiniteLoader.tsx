import { delay, ProfileIdentifier } from '@masknet/shared-base'
import { last } from 'lodash-es'
import { createContext, useContext, useEffect, useState, useTransition, Suspense, useRef } from 'react'
import { FixedSizeList } from 'react-window'
// @ts-ignore
import InfiniteLoader from 'react-window-infinite-loader'
import type { Profile } from '../../../database'
import Services from '../../../extension/service'
import { ProfileInList } from './ProfileInList'
import { ProfileInListSkeleton } from './ProfileInListSkeleton'

const Context = createContext<
    Pick<SelectProfileVirtualizedUIProps, 'disabled' | 'highlighText' | 'isSelected' | 'onChange' | 'resource'>
>(null!)
function Row(props: { style: any; index: number }) {
    const { style, index } = props
    const { disabled, highlighText, isSelected, onChange, resource } = useContext(Context)
    const items = resource.read().profiles
    const item = items[index]
    if (!item) return <ProfileInListSkeleton />
    return (
        <ProfileInList
            ListItemProps={{ style }}
            item={item}
            search={highlighText}
            checked={isSelected(item.identifier)}
            disabled={disabled}
            onChange={(_, checked) => onChange(item.identifier, checked)}
        />
    )
}
interface SelectProfileVirtualizedUIProps {
    disabled: boolean
    isNextPageLoading: boolean
    resource: Resource
    loadNextPage: () => void
    highlighText: string
    isSelected(id: ProfileIdentifier): boolean
    onChange(id: ProfileIdentifier, selected: boolean): void
}
function SelectProfileVirtualizedUI(props: SelectProfileVirtualizedUIProps) {
    // To avoid the UI collapse when there is fewer items
    const historyMax = useRef(0)

    const { loadNextPage, resource, isNextPageLoading } = props
    const { hasNext: hasNextPage, profiles: items } = resource.read()
    console.log('UI', hasNextPage, items)
    const { highlighText, isSelected, disabled, onChange } = props

    const itemCount = hasNextPage ? items.length + 1 : items.length

    // Only load 1 page of items at a time.
    // Pass an empty callback to InfiniteLoader in case it asks us to load more than once.
    const loadMoreItems = loadNextPage
    const isItemLoaded = (index: number) => !hasNextPage || index < items.length

    // Dialog size when this list is size 0.
    // AutoResize doesn't work
    const DIALOG_SIZE = 175
    const ITEM_HEIGHT = 56
    const MAX_HEIGHT = window.innerHeight - DIALOG_SIZE - ITEM_HEIGHT * 2
    const MEDIUM_HEIGHT = ITEM_HEIGHT * itemCount
    const MIN_HEIGHT = 3 * ITEM_HEIGHT
    const HEIGHT = Math.max(MIN_HEIGHT, Math.min(MAX_HEIGHT, MEDIUM_HEIGHT))
    if (historyMax.current < HEIGHT) historyMax.current = HEIGHT

    /**
     * FixedSizeList call the children as a Component,
     * (see https://github.com/bvaughn/react-window/blob/master/src/createListComponent.js#L325)
     * thus we cannot use an inline version, because it is a new component every render,
     * and cause DOM full destory-create every time.
     *
     * But we need to capture some props, so we have to use Context to pass those props.
     *
     * The context is provided as an instant value,
     * which means it will cause the Row component re-render every time,
     * but it's better than re-create every time.
     *
     * I (Jack) think it doesn't worth to memo the context value so I didn't do that.
     */
    // Note: no need to do the same thing to the InfiniteLoader because it call children as a Function
    // see https://github.com/bvaughn/react-window-infinite-loader/blob/master/src/InfiniteLoader.js#L73
    return (
        <Context.Provider value={{ disabled, highlighText, isSelected, resource, onChange }}>
            <InfiniteLoader
                isItemLoaded={isItemLoaded}
                itemCount={itemCount}
                loadMoreItems={loadMoreItems}
                children={({ onItemsRendered, ref }: any) => (
                    <FixedSizeList
                        ref={ref}
                        itemSize={ITEM_HEIGHT}
                        height={Math.max(HEIGHT, historyMax.current)}
                        width="100%"
                        itemCount={itemCount}
                        onItemsRendered={onItemsRendered}
                        children={Row}
                    />
                )}
            />
        </Context.Provider>
    )
}

export interface SelectProfileVirtualizedProps {
    isSelected: (id: ProfileIdentifier) => boolean
    onChange(id: ProfileIdentifier, selected: boolean): void
    disabled: boolean
    search: string
}
export function SelectProfileVirtualized(props: SelectProfileVirtualizedProps) {
    const { currentSearchLoadMore, isLoading, search, setSearch } = useSearchProfiles()
    useEffect(() => setSearch(props.search), [props.search])
    return (
        <Suspense fallback="<ProfileInListSkeleton />">
            <SelectProfileVirtualizedUI
                disabled={props.disabled}
                highlighText={props.search}
                isSelected={props.isSelected}
                onChange={props.onChange}
                resource={search}
                isNextPageLoading={isLoading}
                loadNextPage={currentSearchLoadMore}
            />
        </Suspense>
    )
}

async function* search(search: string) {
    const count = 2
    let state: readonly Profile[] = []

    const self = await Services.Settings.getCurrentPersonaIdentifier()
    await delay(2000)
    while (true) {
        const newProfiles = await Services.Identity.queryProfilePaged(
            {
                after: last(state)?.identifier,
                hasPublicKey: true,
                isContactOf: self,
                network: 'twitter.com',
                // "" => undefined
                query: search || undefined,
            },
            count,
        )
        state = state.concat(newProfiles)
        yield state
        if (newProfiles.length < count) break
    }
}
type Q = Promise<unknown> & {
    profiles?: readonly Profile[]
    hasNext?: boolean
    err?: any
}
type Resource = {
    read(): { hasNext: boolean; profiles: readonly Profile[] }
    getNextSnapshot(): Resource
}
class Cache {
    constructor(private query: string) {
        console.log('create cache')
    }
    private generator = search(this.query)
    private previous: Q[] = []
    createSnapshot(): Resource {
        console.log('Create snapshot', this)
        if (this.previous.length === 0) this.next()
        const snapshot = last(this.previous)!
        const r: Resource = {
            read: () => {
                console.log('Read resource', snapshot.hasNext, snapshot.profiles)
                if (!snapshot.profiles) {
                    console.log('Read resource !!!!', snapshot.hasNext, ...this.previous)
                    throw snapshot
                }
                if (snapshot.err) throw snapshot.err
                return { hasNext: !!snapshot.hasNext, profiles: snapshot.profiles }
            },
            getNextSnapshot: () => {
                console.log('Get next snapshot', snapshot.hasNext, snapshot.profiles)
                const prev = last(this.previous)
                if (prev && !prev.err) {
                    // last one still loading
                    if (!prev.profiles) return r
                    // last one is the final one
                    if (prev.hasNext === false) return r
                }
                this.next()
                return this.createSnapshot()
            },
        }
        Object.defineProperty(r, 'snap', {
            get() {
                return snapshot.profiles
            },
        })
        return r
    }
    private next() {
        console.log('Generator[[next]]')
        const prev = last(this.previous)
        const iter: Q = this.generator.next().then(
            (x) => {
                console.log('Generator[[next]] resolved', x)
                iter.hasNext = !x.done
                iter.profiles = x.value || prev?.profiles || []
            },
            (err) => (iter.err = err),
        )
        this.previous.push(iter)
    }
}

function useSearchProfiles() {
    const [isPending, startTransition] = useTransition()
    const [query, setQuery] = useState(() => new Cache(''))
    const [searchObject, setSearchObject] = useState(() => query.createSnapshot())
    console.log('useSearchProfiles', isPending, query, searchObject)

    return {
        isLoading: isPending,
        search: searchObject,
        setSearch(key: string) {
            startTransition(() => {
                const next = new Cache(key)
                setQuery(next)
                setSearchObject(next.createSnapshot())
            })
        },
        currentSearchLoadMore() {
            console.log('Load more')
            startTransition(() => {
                setSearchObject((x) => x.getNextSnapshot())
            })
        },
    }
}
