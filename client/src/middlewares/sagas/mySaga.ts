import { takeLatest } from 'redux-saga/effects'

import { Action } from '~/actions'

function* fetchUser(action: Action) {
  console.log('fetch')
}

function* mySaga() {
  yield takeLatest('USER_FETCH_REQUESTED', fetchUser)
}

export default mySaga
