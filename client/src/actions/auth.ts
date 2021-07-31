import { createAction } from 'typesafe-actions'

export const setUserId = createAction('auth/SET_USER_ID')<string, void>()

export const sendUsername = createAction('auth/SEND_USERNAME')<string, void>()
