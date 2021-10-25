import type { Pool } from '../types'
import { memo } from 'react'
import { Box } from '@mui/material'
import { NewPoolView } from './NewPoolView'

interface NewPoolsViewProps {
    pools: Pool[]
}

export const NewPoolsView = memo<NewPoolsViewProps>(({ pools }) => {
    return (
        <Box display="flex" position="relative" p={0.5} justifyContent="center" flexDirection="column">
            {pools.map((pool) => (
                <NewPoolView key={pool.prizePool.address} pool={pool} />
            ))}
        </Box>
    )
})
