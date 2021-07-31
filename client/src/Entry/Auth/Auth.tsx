import React from 'react'
import Button from 'rsuite/lib/Button'
import Icon from 'rsuite/lib/Icon'
import Input from 'rsuite/lib/Input'
import InputGroup from 'rsuite/lib/InputGroup'

import styles from './Auth.scss'

const Auth = () => {
  return (
    <div className={styles.base}>
      <InputGroup inside className={styles.inputGroup}>
        <InputGroup.Addon>
          <Icon icon="avatar" />
        </InputGroup.Addon>
        <Input placeholder="Enter username" />
        <Button appearance="primary" className={styles.button}>
          <Icon icon="long-arrow-right" />
        </Button>
      </InputGroup>
    </div>
  )
}

export default React.memo(Auth)
