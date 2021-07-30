import { useSelector as useReduxSelector, shallowEqual } from 'react-redux'

const useSelector: typeof useReduxSelector = (selector) =>
  useReduxSelector(selector, shallowEqual)

export default useSelector
