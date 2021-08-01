import * as IO from 'fp-ts/lib/IO'
import * as S from 'fp-ts/lib/State'

export type Id = S.State<number, number>

export const next: Id = (currentId: number) => {
  return [currentId, currentId + 2]
}

export const map = S.map(next)
export const chain = S.chain

export const createUniqId = (init: number) => {
  let [state] = next(init)
  return (): IO.IO<number> => () => {
    const [currentId, nextId] = next(state)
    state = nextId
    return currentId
  }
}
