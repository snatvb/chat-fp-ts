import * as F from 'fluture'

export const make = (timeout: number) =>
  F.Future((_, resolve) => {
    const timeoutId = setTimeout(resolve, timeout)
    return () => clearTimeout(timeoutId)
  })

export const fork = F.fork
