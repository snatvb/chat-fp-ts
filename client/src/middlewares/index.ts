import * as sagas from './sagas'

export const middlewares = [sagas.middleware]

export const runSagas = () => {
  sagas.run()
}
