import * as E from 'fp-ts/lib/Either'
import { identity, pipe } from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'
import { useSelector } from 'react-redux'
import * as H from 'shared/helpers'
import { State } from '~/store'

export const select = (state: State) => state.auth
export const userId = (state: State) =>
  pipe(select(state), E.map(H.prop('userId')), O.fromEither)

export const username = (state: State) =>
  pipe(
    state,
    select,
    E.mapLeft(H.prop('username')),
    E.fold(identity, () => O.none),
  )

export const useUserId = () => useSelector(userId)
export const useUsername = () => useSelector(username)
