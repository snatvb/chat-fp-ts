import { applyMiddleware, combineReducers, compose, createStore } from 'redux'
import { StateType } from 'typesafe-actions'

import actions from './actions'
import { middlewares, runSagas } from './middlewares'
import rootReducer from './reducers'

const middlewareEnhancer = applyMiddleware(...middlewares)
const composedEnhancers = compose(middlewareEnhancer)
const combinedReducer = combineReducers(rootReducer)
const store = createStore(combinedReducer, undefined, composedEnhancers)

runSagas()
store.dispatch(actions.app.initialize())

export type State = StateType<typeof combinedReducer>

export default store
