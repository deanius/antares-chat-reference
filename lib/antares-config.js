import { List as iList } from 'immutable'
import { createReducer } from 'redux-act'
import { combineReducers } from 'redux-immutable'
import { createConsequence } from 'meteor/deanius:antares'

export const Actions = {
    Message: {
        send: ({ message, sender }) => ({
            type: 'Message.send',
            payload: {
                message,
                sender,
                // Since the user cares about sentAt it's payload, not simply metadata
                sentAt: new Date()
            }
        })
    },
    Activity: {
        type: () => ({
            type: 'Activity.type',
            meta: { antares: { localOnly: true }}
        }),
        notifyOfTyping: (active = true) => ({
            type: 'Activity.notifyOfTyping',
            payload: active
        })
    },
    Conversation: {
        start: ({ selfID, otherID }) => ({
            type: 'Antares.storeAtKey',
            payload: { senders: { selfID, otherID } }
        })
    },
}

export const MetaEnhancers = [
    () => ({ key: 'chat:demo' })
]

const messageReducer = createReducer({
    'Message.send': (msgs, message) => msgs.push(message)
}, new iList())

export const Reducers = {
    Conversation: combineReducers({
        senders: state => state,
        messages: messageReducer
    })
}

export const ReducerForKey = (key) => Reducers.Conversation

export const Epics = {
    notifyOfTyping: (action$, state) => {
        return action$
            .ofType('Activity.type')
            .throttleTime(2000)
            .map(createConsequence({
                type: 'Activity.notifyOfTyping',
                payload: true
            }))
    }
}
