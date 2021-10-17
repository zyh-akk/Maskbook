import { useState, useCallback } from 'react'
import { Button, InputBase, DialogContent, DialogActions } from '@material-ui/core'
import { makeStyles } from '@masknet/theme'
import { useI18N } from '../../../utils'
import { ProfileIdentifier, useStylesExtends } from '@masknet/shared'
import { InjectedDialog } from '../InjectedDialog'
import { SelectProfileVirtualized } from './InfiniteLoader'

const useStyles = makeStyles()((theme) => ({
    content: {
        padding: '0 !important',
    },
    title: {
        marginLeft: 6,
    },
    input: { flex: 1, minWidth: '10em', marginLeft: 20, marginTop: theme.spacing(1) },
}))

export interface SelectRecipientsDialogUIProps extends withClasses<never> {
    open: boolean
    selected: ProfileIdentifier[]
    disabled: boolean
    submitDisabled: boolean
    onSubmit: () => void
    onClose: () => void
    onSelect: (item: ProfileIdentifier) => void
    onDeselect: (item: ProfileIdentifier) => void
}
export function SelectRecipientsDialogUI(props: SelectRecipientsDialogUIProps) {
    const { t } = useI18N()
    const classes = useStylesExtends(useStyles(), props)
    const [search, setSearch] = useState('')

    const isSelected = useCallback(
        (id: ProfileIdentifier) => Boolean(props.selected.find((x) => x.equals(id))),
        [props.selected],
    )
    const onChange = useCallback(
        (id, status) => {
            if (status) props.onSelect(id)
            else props.onDeselect(id)
        },
        [props.onSelect, props.onDeselect],
    )
    return (
        <InjectedDialog open={props.open} title={t('select_specific_friends_dialog__title')} onClose={props.onClose}>
            <DialogContent>
                <InputBase
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className={classes.input}
                    placeholder={t('search_box_placeholder')}
                />
                <SelectProfileVirtualized
                    search={search}
                    disabled={props.disabled}
                    onChange={onChange}
                    isSelected={isSelected}
                />
                {/* <List style={{ height: items.length * LIST_ITEM_HEIGHT }} dense>
                    {itemsAfterSearch.length === 0 ? (
                        <ListItem>
                            <ListItemText primary={t('no_search_result')} />
                        </ListItem>
                    ) : (
                        itemsAfterSearch.map((item) => (
                            <ProfileInList
                                key={item.identifier.toText()}
                                item={item}
                                search={search}
                                checked={
                                    props.selected.some((x) => x.identifier.equals(item.identifier)) ||
                                    disabledItems?.includes(item)
                                }
                                disabled={props.disabled || disabledItems?.includes(item)}
                                onChange={(_, checked) => {
                                    if (checked) {
                                        props.onSelect(item)
                                    } else {
                                        props.onDeselect(item)
                                    }
                                }}
                            />
                        ))
                    )}
                </List> */}
            </DialogContent>
            <DialogActions>
                <Button
                    style={{ marginLeft: 'auto' }}
                    variant="contained"
                    disabled={props.submitDisabled}
                    onClick={props.onSubmit}>
                    {t('select_specific_friends_dialog__button')}
                </Button>
            </DialogActions>
        </InjectedDialog>
    )
}
