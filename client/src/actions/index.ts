import { ActionType } from 'typesafe-actions'

import * as app from './app'
import * as counter from './counter'
import * as ws from './ws'

const actions = { counter, ws, app }

export type Action = ActionType<typeof actions>

export default actions
