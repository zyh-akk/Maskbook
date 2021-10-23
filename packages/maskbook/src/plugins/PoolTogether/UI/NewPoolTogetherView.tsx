import { makeStyles, MaskColorVar } from '@masknet/theme'
import { useI18N } from '../../../utils'
import React, { useState } from 'react'
import { Tab, Tabs } from '@mui/material'
import { useAllPools } from '../hooks/usePools'

const useStyles = makeStyles()((theme) => ({
    tabs: {
        width: '100%',
        minHeight: 'unset',
    },
    tab: {
        minHeight: 'unset',
        minWidth: 'unset',
        backgroundColor: MaskColorVar.twitterBg,
        color: MaskColorVar.twitterSecond,
    },
    selected: {
        color: MaskColorVar.blue,
        backgroundColor: 'inherit',
    },
}))

export function NewPoolTogetherView() {
    const { t } = useI18N()
    const { classes } = useStyles()

    const { value: _pools = [], error: error, loading, retry } = useAllPools()

    _pools.sort((x, y) => Number(y.prize.weeklyTotalValueUsd) - Number(x.prize.weeklyTotalValueUsd))

    //#region tabs
    const [tabIndex, setTabIndex] = useState(0)
    const tabs = [
        <Tab
            classes={{ root: classes.tab, selected: classes.selected }}
            key="pools"
            label={t('plugin_pooltogether_tab_pools')}
        />,
        <Tab
            classes={{ root: classes.tab, selected: classes.selected }}
            key="account"
            label={t('plugin_pooltogether_tab_account')}
        />,
    ].filter(Boolean)
    //#endregion

    return (
        <Tabs
            className={classes.tabs}
            variant="fullWidth"
            value={tabIndex}
            onChange={(ev: React.ChangeEvent<{}>, newValue: number) => setTabIndex(newValue)}
            TabIndicatorProps={{
                style: {
                    display: 'none',
                },
            }}>
            {tabs}
        </Tabs>
    )
}
