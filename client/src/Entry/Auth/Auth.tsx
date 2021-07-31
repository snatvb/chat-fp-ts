import * as O from 'fp-ts/lib/Option'
import React from 'react'
import Button from 'rsuite/lib/Button'
import Icon from 'rsuite/lib/Icon'
import Input from 'rsuite/lib/Input'
import InputGroup from 'rsuite/lib/InputGroup'
import actions from '~/actions'
import useAction from '~/hooks/useAction'
import * as selectors from '~/selectors'

import styles from './Auth.scss'
import EnterUsername from './EnterUsername'

const Auth = () => {
  const username = selectors.auth.useUsername()
  const sendUsername = useAction(actions.auth.sendUsername)
  const handleSendUsername = React.useCallback(sendUsername, [])

  return O.fold(
    () => <EnterUsername onSend={handleSendUsername} />,
    () => <div />,
  )(username)
}

export default React.memo(Auth)
