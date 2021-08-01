import * as PKT from 'shared/Packet'

import * as MID from './MessageId'

export const pack = PKT.createPack(MID.get)
