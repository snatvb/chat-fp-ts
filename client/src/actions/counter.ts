import { createCustomAction, createAction } from 'typesafe-actions'

export const add = createCustomAction('counter/ADD', (n: number) => ({
  payload: { n },
}))

export const reset = createAction('counter/RESET')()
