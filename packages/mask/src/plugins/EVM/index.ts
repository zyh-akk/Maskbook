import { registerPlugin } from '@masknet/plugin-infra'
import { base } from './base'

registerPlugin({
    ...base,

    Worker: {
        load: () => import('./Worker'),
        hotModuleReload: (hot) =>
            import.meta.webpackHot && import.meta.webpackHot.accept('./Worker', () => hot(import('./Worker'))),
    },
})
