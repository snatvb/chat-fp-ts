import * as E from 'fp-ts/lib/Either'
import { identity, pipe } from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'
import { Reducer } from 'redux'
import * as Lo from 'shared/Loading'
import { getType } from 'typesafe-actions'
import { Action } from '~/actions'
import { sendUsername, setUserId } from '~/actions/auth'

export type AuthedState = { userId: string }
export type LoadingSuccess =
  | { type: 'registration'; displayName: O.Option<string> }
  | { type: 'ok' }
export type UnauthedState = {
  username: O.Option<string>
  loading: O.Option<Lo.Loading<LoadingSuccess, Error>>
}
export type AuthState = E.Either<UnauthedState, AuthedState>

const initialState: AuthState = E.left({ username: O.none, loading: O.none })

const reduce: Reducer<AuthState, Action> = (
  state = initialState,
  action: Action,
) => {
  switch (action.type) {
    case getType(sendUsername):
      return pipe(
        state,
        E.mapLeft((prevState) => ({
          ...prevState,
          username: O.some(action.payload),
        })),
      )

    case getType(setUserId):
      return E.right({ userId: action.payload })

    default:
      return state
  }
}

export default reduce
