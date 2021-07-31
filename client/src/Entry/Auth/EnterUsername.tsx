import React from 'react'
import Button from 'rsuite/lib/Button'
import Icon from 'rsuite/lib/Icon'
import Input from 'rsuite/lib/Input'
import InputGroup from 'rsuite/lib/InputGroup'

import styles from './Auth.scss'

export type EnterUsernameProps = {
  onSend: (username: string) => void
}

const EnterUsername = ({ onSend }: EnterUsernameProps) => {
  const [username, setUsername] = React.useState('')

  React.useEffect(() => {
    const handleEnter = (event: KeyboardEvent) => {
      if (event.code === 'Enter') {
        onSend(username)
      }
    }

    window.addEventListener('keydown', handleEnter)
    return () => window.removeEventListener('keydown', handleEnter)
  }, [onSend, username])

  return (
    <div className={styles.base}>
      <InputGroup inside className={styles.inputGroup}>
        <InputGroup.Addon>
          <Icon icon="avatar" />
        </InputGroup.Addon>
        <Input
          placeholder="Enter username"
          value={username}
          onChange={(value) => setUsername(value)}
        />
        <Button
          appearance="primary"
          className={styles.button}
          onClick={() => onSend(username)}
        >
          <Icon icon="long-arrow-right" />
        </Button>
      </InputGroup>
    </div>
  )
}

export default React.memo(EnterUsername)
