import { List as iList } from 'immutable'
import { createReducer } from 'redux-act'
import { combineReducers } from 'redux-immutable'

export const Actions = {
    Message: {
        send: ({ message }) => ({
            type: 'Message.send',
            payload: { message }
        })
    },
    Conversation: {
        start: ({ selfID, otherID }) => ({
            type: 'Antares.storeAtKey',
            payload: { senders: { selfID, otherID } }
        })
    }
}

export const MetaEnhancers = [
    () => ({ key: 'chat:demo' })
]

const messageReducer = createReducer({
    'Message.send': (msgs, { message }) => msgs.push({ message })
}, new iList())

export const Reducers = {
    Conversation: combineReducers({
        senders: state => state,
        messages: messageReducer
    })
}

export const ReducerForKey = (key) => Reducers.Conversation
