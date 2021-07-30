import { useDispatch } from 'react-redux'
import { Action } from '../actions'

const useAction = <T extends (...args: any) => Action>(actionFn: T) => {
  const dispatch = useDispatch()
  return (...args: Parameters<T>): ReturnType<T> =>
    dispatch(actionFn(...(args as any))) as any
}

export default useAction
