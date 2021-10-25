import type { Pool } from '../types'
import { memo, useCallback, useEffect, useState } from 'react'
import { useI18N } from '../../../utils'
import { usePoolURL } from '../hooks/usePoolURL'
import { useChainId, useERC20TokenDetailed } from '../../../../../web3-shared/evm'
import { calculateNextPrize, calculateSecondsRemaining, getPrizePeriod } from '../utils'
import { makeStyles } from '@masknet/theme'
import { Box, Button, CircularProgress, Grid, Typography } from '@mui/material'
import { RefreshIcon } from '@masknet/icons'
import { TokenIcon } from '@masknet/shared'
import { CountdownView } from './CountdownView'
import { first } from 'lodash-es'

const useStyles = makeStyles()((theme) => ({
    root: {
        padding: theme.spacing(2),
        alignItems: 'stretch',
        backgroundColor: '#341762',
        margin: theme.spacing(1, 0),
        borderRadius: theme.spacing(1),
        '&:hover': {
            backgroundColor: '#43286e',
        },
        fontSize: 14,
        display: 'flex',
        alignContent: 'center',
        justifyContent: 'center',
    },
    progress: {
        bottom: theme.spacing(1),
        right: theme.spacing(1),
    },
    refresh: {
        bottom: theme.spacing(1),
        right: theme.spacing(1),
        fontSize: 15,
    },
    prize: {
        background:
            'linear-gradient(40deg,#ff9304,#ff04ea 10%,#9b4beb 20%,#0e8dd6 30%,#0bc6df 40%,#07d464 50%,#dfd105 60%,#ff04ab 78%,#8933eb 90%,#3b89ff)',
        '-webkit-background-clip': 'text',
        color: 'transparent',
        animation: '$rainbow_animation 6s linear infinite',
        backgroundSize: '600% 600%',
        fontSize: '1.2rem',
        '@media (min-width:600px)': {
            fontSize: '2rem',
        },
    },
    icon: {
        width: theme.spacing(4),
        height: theme.spacing(4),
        marginRight: theme.spacing(1),
        backgroundColor: 'transparent',
    },
    viewPool: {
        cursor: 'pointer',
        color: '#3ef3d4',
        textDecoration: 'none',
        marginRight: theme.spacing(0.5),
        '&:last-child': {
            marginRight: 0,
        },
        '&:hover': {
            color: '#ffffff',
        },
    },
    deposit: {
        backgroundColor: '#3ef3d4',
        color: '#4c249f',
        padding: '10px 0',
    },
    column: {
        display: 'flex',
        width: '100%',
        alignItems: 'center',
    },
}))

interface NewPoolViewProps {
    pool: Pool
}

export const NewPoolView = memo<NewPoolViewProps>(({ pool }) => {
    const { t } = useI18N()
    const { classes } = useStyles()
    const poolURL = usePoolURL(pool)
    const chainId = useChainId()
    const [prize, setPrize] = useState('TBD')
    const [period, setPeriod] = useState('Custom Period')

    //#region pool token
    const {
        value: token,
        loading: loadingToken,
        retry: retryToken,
        error: errorToken,
    } = useERC20TokenDetailed(pool.tokens.underlyingToken.address)
    //#endregion

    //#region process data
    const prizePeriodSeconds = Number.parseInt(pool.config.prizePeriodSeconds, 10)
    useEffect(() => {
        setPrize(calculateNextPrize(pool))
        setPeriod(getPrizePeriod(t, prizePeriodSeconds))
    }, [pool])
    //#endregion

    const onDeposit = useCallback(() => {
        if (!pool || !token) return
    }, [pool, token])

    if (loadingToken) {
        return (
            <div className={classes.root}>
                <CircularProgress className={classes.progress} color="primary" size={15} />
            </div>
        )
    }

    if (errorToken) {
        return (
            <div className={classes.root}>
                <RefreshIcon className={classes.refresh} color="primary" onClick={retryToken} />
            </div>
        )
    }

    if (!token) {
        return (
            <Typography className={classes.prize} variant="h5" fontWeight="fontWeightBold">
                {t('plugin_pooltogether_token_not_found')}
            </Typography>
        )
    }

    const tokenFaucet = first(pool.tokenFaucets)
    const tokenFaucetDripToken = first(pool.tokens.tokenFaucetDripTokens)

    return (
        <Grid container direction="column" className={classes.root}>
            <Box className={classes.column}>
                <Box maxWidth="40%" flex={1} display="flex" flexDirection="column">
                    <Box display="flex" pt={1} justifyContent="center">
                        <TokenIcon address={token.address} name={token.symbol} classes={{ icon: classes.icon }} />
                        <Typography fontSize={24} lineHeight="30px" fontWeight={600} color="#ffffff" ml={1.2}>
                            {prize}
                        </Typography>
                    </Box>
                    <Box
                        display="flex"
                        justifyContent="center"
                        py={0.5}
                        px={1.5}
                        alignSelf="center"
                        borderRadius="15px"
                        mt={0.5}
                        style={{ background: 'rgba(119, 224, 181, 0.1)' }}>
                        <Typography fontSize={16} fontWeight={600} lineHeight="22px" color="#36F1CE">
                            {t('plugin_pooltogether_prize', { period: period })}
                        </Typography>
                    </Box>
                </Box>
                <Box maxWidth="60%" flex={1}>
                    <CountdownView
                        secondsRemaining={calculateSecondsRemaining(pool)}
                        msgOnEnd={t('plugin_pooltogether_pool_ended')}
                    />
                </Box>
            </Box>
            <Box mt={2} className={classes.column}>
                <Box maxWidth="40%" flex={1} display="flex" flexDirection="column">
                    {tokenFaucet && tokenFaucetDripToken ? (
                        <Typography fontSize={14} fontWeight={600} lineHeight="20px" color="#EDF1F2">
                            {t('plugin_pooltogether_apr', {
                                apr: tokenFaucet.apr?.toFixed(2) ?? 0,
                                token: tokenFaucetDripToken.symbol,
                            })}
                        </Typography>
                    ) : null}
                    <a className={classes.viewPool} target="_blank" rel="noopener noreferrer" href={poolURL}>
                        <Typography fontSize={14} lineHeight="20px" fontWeight={600}>
                            {t('plugin_pooltogether_view_pool')}
                        </Typography>
                    </a>
                </Box>
                <Box maxWidth="60%" flex={1}>
                    <Button className={classes.deposit} variant="contained" fullWidth size="small" onClick={onDeposit}>
                        {t('plugin_pooltogether_deposit', { token: token.symbol })}
                    </Button>
                </Box>
            </Box>
        </Grid>
    )
})
