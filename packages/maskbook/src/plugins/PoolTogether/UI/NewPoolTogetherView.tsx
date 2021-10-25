import { makeStyles, MaskColorVar } from '@masknet/theme'
import { useI18N } from '../../../utils'
import React, { useEffect, useState } from 'react'
import { CircularProgress, Paper, Tab, Tabs, Typography } from '@mui/material'
import { useAllPools, usePool } from '../hooks/usePools'
import { usePoolTogetherConstants } from '../../../../../web3-shared/evm'
import type { Pool } from '../types'
import { RefreshIcon } from '@masknet/icons'
import { NewPoolsView } from './NewPoolsView'

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
    refresh: {
        bottom: theme.spacing(1),
        right: theme.spacing(1),
        padding: theme.spacing(1),
        fontSize: 'inherit',
    },
    progress: {
        bottom: theme.spacing(1),
        right: theme.spacing(1),
        padding: theme.spacing(1),
    },
    message: {
        color: theme.palette.text.primary,
        textAlign: 'center',
    },
    body: {
        flex: 1,
        overflow: 'auto',
        maxHeight: 350,
        borderRadius: 0,
        scrollbarWidth: 'none',
        '&::-webkit-scrollbar': {
            display: 'none',
        },
    },
}))

export function NewPoolTogetherView() {
    const { t } = useI18N()
    const { classes } = useStyles()
    const [pools, setPools] = useState<Pool[]>([])

    const { value: _pools = [], error: error, loading, retry } = useAllPools()
    _pools.sort((x, y) => Number(y.prize.weeklyTotalValueUsd) - Number(x.prize.weeklyTotalValueUsd))

    //#region mask pool
    const { MASK_POOL_ADDRESS, MASK_POOL_SUBGRAPH } = usePoolTogetherConstants()
    const {
        value: maskPool,
        error: errorMask,
        loading: loadingMask,
        retry: retryMask,
    } = usePool(MASK_POOL_ADDRESS, MASK_POOL_SUBGRAPH, true)
    //#endregion

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

    useEffect(() => {
        if (maskPool) {
            setPools([maskPool, ..._pools])
        } else {
            setPools(_pools)
        }
    }, [_pools, maskPool])

    if (loading || loadingMask) {
        return <CircularProgress className={classes.progress} color="primary" size={15} />
    }

    if (error || errorMask) {
        return <RefreshIcon className={classes.refresh} color="primary" onClick={error ? retry : retryMask} />
    }

    if (pools.length === 0) {
        return <Typography className={classes.message}>{t('plugin_pooltogether_no_pool')}</Typography>
    }

    return (
        <>
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
            <Paper className={classes.body}>{tabIndex === 0 ? <NewPoolsView pools={pools} /> : null}</Paper>
        </>
    )
}
