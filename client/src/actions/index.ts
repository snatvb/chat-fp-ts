import { ActionType } from 'typesafe-actions'

import * as counter from './counter'

const actions = { counter }

export type Action = ActionType<typeof actions>

export default actions
