import React from 'react'
import { Home } from '~/components/Home'

import styles from './Main.scss'

export const Main = React.memo(() => {
  return (
    <div className={styles.base}>
      <Home />
      {process.env.NODE_ENV === 'development' && (
        <div className={styles.devMode}>development mode</div>
      )}
    </div>
  )
})
