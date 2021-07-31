import 'normalize.css'
import './global.scss'
import 'rsuite/dist/styles/rsuite-dark.css'

import React from 'react'
import ReactDOM from 'react-dom'
import { Provider as Redux } from 'react-redux'
import { BrowserRouter as Router } from 'react-router-dom'

import { Entry } from './Entry'
import store from './store'

const App = () => {
  return (
    <Router>
      <Redux store={store}>
        <Entry />
      </Redux>
    </Router>
  )
}

ReactDOM.render(<App />, document.getElementById('root'))
