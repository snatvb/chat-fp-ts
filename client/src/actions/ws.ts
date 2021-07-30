import * as PKT from 'shared/Packet'
import { createCustomAction } from 'typesafe-actions'
import * as WS from '~/lib/ws'

export const received = createCustomAction(
  '@ws/RECEIVED',
  (packet: PKT.Packet) => ({
    payload: { packet },
  }),
)

export const send = createCustomAction('@ws/SEND', (data: string) => ({
  payload: { data },
}))

export const setConnectionStatus = createCustomAction(
  '@ws/SET_CONNECTION_STATUS',
  (status: WS.ConnectionStatus) => ({
    payload: { status },
  }),
)
