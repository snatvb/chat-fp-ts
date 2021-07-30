import { Reducer } from 'redux'
import { getType } from 'typesafe-actions'

import { Action } from '~/actions'
import { add, reset } from '~/actions/counter'

export type CounterState = {
  value: number
}

const initialState: CounterState = {
  value: 0,
}

export const reduceCounter: Reducer<CounterState, Action> = (
  state = initialState,
  action: Action,
) => {
  switch (action.type) {
    case getType(add):
      return { ...state, value: state.value + action.payload.n }
    case getType(reset):
      return initialState
    default:
      return state
  }
}
