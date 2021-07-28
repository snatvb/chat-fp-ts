import * as IO from 'fp-ts/lib/IO'
import { v4 as uuid } from 'uuid'

export const generate = IO.of(uuid)
