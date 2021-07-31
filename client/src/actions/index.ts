import { ActionType } from 'typesafe-actions'

import * as app from './app'
import * as auth from './auth'
import * as counter from './counter'
import * as ws from './ws'

const actions = { counter, ws, app, auth }

export type Action = ActionType<typeof actions>

export default actions
