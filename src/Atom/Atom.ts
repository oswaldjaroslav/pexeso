
type TStateSetter<T> = (oldValue: T) => T

export const createAtom = <T>(initialState: T) => {
  let state = initialState

  return {
    setState: (value: T | TStateSetter<T>) => {
      if (typeof value === 'function') {
        const valueFn = value as TStateSetter<T>
        state = valueFn(state)
      } else {
        state = value
      }
    },
    getState: () => state
  }

}