import classNames from 'classnames'
import { ListItem, ListItemText, Checkbox, ListItemAvatar, Skeleton } from '@material-ui/core'
import { makeStyles } from '@masknet/theme'
import type { DefaultComponentProps } from '@material-ui/core/OverridableComponent'
import type { CheckboxProps } from '@material-ui/core/Checkbox'
import type { ListItemTypeMap } from '@material-ui/core/ListItem'

const useStyle = makeStyles()({
    root: {
        cursor: 'wait',
        paddingLeft: 8,
    },
})

export interface ProfileInListSkeletonProps {
    CheckboxProps?: Partial<CheckboxProps>
    ListItemProps?: Partial<DefaultComponentProps<ListItemTypeMap<{ button: false }, 'li'>>>
}
export function ProfileInListSkeleton(props: ProfileInListSkeletonProps) {
    const { classes } = useStyle()
    return (
        <ListItem {...props.ListItemProps} className={classNames(classes.root, props.ListItemProps?.className)}>
            <Checkbox disabled color="primary" {...props.CheckboxProps} />
            <ListItemAvatar>
                <Skeleton variant="circular" animation="wave" width={40} height={40} />
            </ListItemAvatar>
            <ListItemText
                primary={<Skeleton variant="text" width="33%" animation="wave" />}
                secondary={<Skeleton variant="text" width="100%" animation="wave" />}
            />
        </ListItem>
    )
}
