import React, { memo } from 'react'
import { NavLink } from 'react-router-dom'

import styles from './NotFound.scss'

export const NotFound = memo(() => {
  return (
    <main className={styles.base}>
      <h1 className={styles.title}>404</h1>
      <p className={styles.description}>Sorry, this page is not found :(</p>
      <NavLink className={styles.link} to="/">
        Go home
      </NavLink>
    </main>
  )
})
