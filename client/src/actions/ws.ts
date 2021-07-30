import * as PKT from 'shared/Packet'
import { createAction, createCustomAction } from 'typesafe-actions'

export const received = createCustomAction(
  '@ws/RECEIVED',
  (packet: PKT.Packet) => ({
    payload: { packet },
  }),
)

export const send = createCustomAction('@ws/SEND', (data: string) => ({
  payload: { data },
}))
