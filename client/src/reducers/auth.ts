import * as E from 'fp-ts/lib/Either'
import { identity, pipe } from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'
import { Reducer } from 'redux'
import { getType } from 'typesafe-actions'
import { Action } from '~/actions'
import { sendUsername, setUserId } from '~/actions/auth'
import * as ADT from '~/helpers/adt'

export type AuthedState = { userId: string }
export type UnauthedState = { username: O.Option<string> }
export type AuthState = E.Either<UnauthedState, AuthedState>

const initialState: AuthState = E.left({ username: O.none })

const reduce: Reducer<AuthState, Action> = (
  state = initialState,
  action: Action,
) => {
  switch (action.type) {
    case getType(sendUsername):
      return E.mapLeft(() => ({ username: O.some(action.payload) }))(state)
    case getType(setUserId):
      return E.right({ userId: action.payload })

    default:
      return state
  }
}

export default reduce
