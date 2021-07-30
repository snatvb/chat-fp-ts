import thunk from 'redux-thunk'

import logger from './logger'
import * as sagas from './sagas'
import ws from './ws'

export const middlewares = [logger, ws, sagas.middleware, thunk]

export const runSagas = () => {
  sagas.run()
}
