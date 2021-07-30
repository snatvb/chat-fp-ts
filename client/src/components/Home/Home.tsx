// NEED FOR EXAMPLE
import React from 'react'
import { Link, Route, Switch } from 'react-router-dom'
import actions from '~/actions'
import useAction from '~/hooks/useAction'
import useSelector from '~/hooks/useSelector'
import * as selectors from '~/selectors'

import styles from './Home.scss'

export const Home = React.memo(() => {
  const counter = useSelector(selectors.counter.select)
  const increment = useAction(() => actions.counter.add(1))
  const decrement = useAction(() => actions.counter.add(-1))
  const reset = useAction(actions.counter.reset)

  return (
    <div className={styles.base}>
      <div>
        <p>{counter.value}</p>
        <button className={styles.button} onClick={decrement}>
          -
        </button>
        <button className={styles.button} onClick={reset}>
          reset
        </button>
        <button className={styles.button} onClick={increment}>
          +
        </button>
      </div>
    </div>
  )
})
