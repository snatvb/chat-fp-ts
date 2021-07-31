import * as O from 'fp-ts/lib/Option'
import React from 'react'
import { Route } from 'react-router'
import { Redirect, RouteProps } from 'react-router-dom'
import * as selectors from '~/selectors'

export type AuthorizedRouterProps = RouteProps & {
  fallback?: string
}

export const AuthorizedRouter = ({
  fallback = '/',
  ...routeProps
}: AuthorizedRouterProps) => {
  const currentUserId = selectors.auth.useUserId()

  return O.isSome(currentUserId) ? (
    <Route {...routeProps} />
  ) : (
    <Redirect to={fallback} />
  )
}
