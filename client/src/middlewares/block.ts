import { Middleware } from 'redux'
import { getType } from 'typesafe-actions'
import actions, { Action } from '~/actions'

// const blackRecord: Record<string, boolean> = {
//   [getType(actions.ws)]
// }

const middleware: Middleware = () => (next) => (action: Action) => {
  if (action.type.startsWith('@ws/')) {
    return
  }

  return next(action)
}

export default middleware
