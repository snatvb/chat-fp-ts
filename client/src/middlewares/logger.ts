import { Middleware } from 'redux'
import { Action } from '~/actions'

const middleware: Middleware = () => (next) => (action: Action) => {
  console.debug(action)
  return next(action)
}

export default middleware
