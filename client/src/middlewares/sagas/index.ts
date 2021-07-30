import createSagaMiddleware from 'redux-saga'
import mySaga from './mySaga'

export const middleware = createSagaMiddleware()

export const run = () => {
  middleware.run(mySaga)
}
