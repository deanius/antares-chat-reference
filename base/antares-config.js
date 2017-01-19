import { ChatReducer } from './reducers'

export { default as Actions } from './actions'
export { ViewReducer } from './reducers'
export { default as Epics } from './epics'

// Tag every action as pertaining to an imaginary record in:
//   The Chats collection, with an id of 'chat:demo'
export const MetaEnhancers = [
    () => ({ key: ['Chats', 'chat:demo'] })
]

// A mapping from a given key such as ['Chats', 'chat:demo'], to a reducer to use.
// Very simple because it's our only object type.
export const ReducerForKey = () => ChatReducer
