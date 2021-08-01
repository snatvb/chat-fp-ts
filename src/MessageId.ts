import * as UniqId from 'shared/UniqId'

const id = UniqId.createUniqId(1)

export const get = id()
