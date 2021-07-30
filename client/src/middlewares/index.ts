import thunk from 'redux-thunk'

import * as sagas from './sagas'
import ws from './ws'

export const middlewares = [ws, sagas.middleware, thunk]

export const runSagas = () => {
  sagas.run()
}
