import * as PKT from 'shared/Packet'

import * as SIO from './StoreIO'

export type User = PKT.User
export type Users = SIO.StoreIO<string, User>

const USERS: Users = SIO.make()

export const save = (user: User) => SIO.write(user.id, user, USERS)
export const get = (id: string) => SIO.read(id, USERS)
export const remove = (id: string) => SIO.remove(id, USERS)
