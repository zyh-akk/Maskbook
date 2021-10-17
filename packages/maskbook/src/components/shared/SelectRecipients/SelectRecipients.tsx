import { Box, Chip } from '@material-ui/core'
import { makeStyles } from '@masknet/theme'
import AddIcon from '@material-ui/icons/Add'
import { useState } from 'react'
import { useI18N } from '../../../utils'
import type { Profile } from '../../../database'
import { SelectRecipientsDialogUI } from './SelectRecipientsDialog'
import { useCurrentIdentity } from '../../DataSource/useActivatedUI'
import type { ProfileIdentifier } from '@masknet/shared-base'

const useStyles = makeStyles()({
    root: {
        display: 'inline-flex',
        flexWrap: 'wrap',
    },
})

export interface SelectRecipientsUIProps {
    selected: ProfileIdentifier[]
    disabled?: boolean
    onSelect(selected: ProfileIdentifier[]): void
}

export function SelectRecipientsUI(props: SelectRecipientsUIProps) {
    const { t } = useI18N()
    const { classes } = useStyles()
    const { selected, onSelect } = props
    // const currentIdentity = useCurrentIdentity()
    const [open, setOpen] = useState(false)

    return (
        <Box className={classes.root}>
            <Chip
                label={t('post_dialog__select_specific_e2e_target_title', {
                    selected: new Set([...selected.map((x) => x.toText())]).size,
                })}
                avatar={<AddIcon />}
                disabled={props.disabled}
                onClick={() => setOpen(true)}
            />
            <SelectRecipientsDialogUI
                open={open}
                selected={selected}
                disabled={false}
                submitDisabled={false}
                onSubmit={() => setOpen(false)}
                onClose={() => setOpen(false)}
                onSelect={(item) => onSelect(selected.concat(item))}
                onDeselect={(item) => onSelect(selected.filter((x) => !x.equals(item)))}
            />
        </Box>
    )
}

SelectRecipientsUI.defaultProps = {
    frozenSelected: [],
}
