import { Just, Maybe } from 'purify-ts'
import { createAtom } from '../../Atom'

interface ICard {
  id: string
  pairId: string
  position: [number, number]
}
interface IBoard {}
interface IBottSettings {}

interface IMemoryItem {
  id: string
  card: ICard
}

interface IBottMemory {
  items: IMemoryItem[]
}

const groupWith = <T>(groupFn: (value: T) => string) => {
  return (data: T[]) =>
    data.reduce((acc: Record<string, T[]>, item) => {
      const key = groupFn(item)
      return {
        ...acc,
        [key]: [...Maybe.fromNullable(acc[key]).orDefault([]), item],
      }
    }, {})
}

const entries = <K extends string, T>(values: Record<K, T>) =>
  Object.entries(values) as [K, T][]

const createIdGenerator = (prefix: string) => {
  let count = 0

  return () => {
    count = count + 1

    return `${prefix}_${count}`
  }
}

const generateId = createIdGenerator('bott-memory-item')

const pickFirstCardFromMemory = (memory: IBottMemory) =>
  Just(memory.items)
    .map(groupWith((item) => item.card.pairId))
    .map(entries)
    .map((items) => items.filter(([_, cards]) => cards.length > 1))
    .chainNullable((items) => items[0])
    .chainNullable(([_, card]) => card[0])

const pickSecondCardFromMemory = (memory: IBottMemory, card: ICard) =>
  Maybe.fromNullable(
    memory.items.find(
      (item) => item.card.pairId === card.pairId && item.card.id !== card.id
    )
  )

const createMemoryItem = (card: ICard) => ({ id: generateId(), card })

export const createBott = () => {
  const state = createAtom<IBottMemory>({ items: [] })

  return {
    makeMove: (board: IBoard, firstCard?: ICard) => {
      const a = (
        firstCard
          ? pickSecondCardFromMemory(state.getState(), firstCard)
          : pickFirstCardFromMemory(state.getState())
      ).map((card) => card)

      if (firstCard) {
        const card = pickSecondCardFromMemory(state.getState(), firstCard)
      } else {
        const card = pickFirstCardFromMemory(state.getState())
      }
    },
  }
}
