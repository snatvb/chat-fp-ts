import React from 'react'
import { Route, Switch } from 'react-router'
import { NotFound } from '~/components/NotFound'

import { Main } from './Main'

export const Entry = () => {
  return (
    <Switch>
      <Route path="/" exact component={Main} />
      <Route component={NotFound} />
    </Switch>
  )
}
