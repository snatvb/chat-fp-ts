import { ActionType } from 'typesafe-actions'

import * as counter from './counter'
import * as ws from './ws'

const actions = { counter, ws }

export type Action = ActionType<typeof actions>

export default actions
