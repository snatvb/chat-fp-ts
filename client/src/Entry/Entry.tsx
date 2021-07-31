import React from 'react'
import { Route, Switch } from 'react-router'
import { AuthorizedRouter } from '~/routers/AuthorizedRouter'

import Auth from './Auth/Auth'
import { Main } from './Main'

export const Entry = () => {
  return (
    <Switch>
      <Route path="/login" component={Auth} />
      <AuthorizedRouter path="/" fallback="/login" component={Main} />
    </Switch>
  )
}
