import { fromJS, List as iList } from 'immutable'
import { createReducer } from 'redux-act'
import { combineReducers } from 'redux-immutable'
import Rx from 'rxjs'
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
    'Message.send': (msgs, message) => msgs.push(fromJS(message))
}, new iList())

const activityReducer = createReducer({
    'Activity.notifyOfTyping': (state, isTyping) => {
        return state.update('activeSenders', list => isTyping ? list.push('UA1') : list.pop() )
    }
}, fromJS({ activeSenders: []}))

export const Reducers = {
    Conversation: combineReducers({
        senders: state => state,
        messages: messageReducer,
        activity: activityReducer
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
    },
    removeTypingNotification: (action$, state) => {
        return action$
            .ofType('Activity.notifyOfTyping')
            .filter(a => a.payload === true)
            // '2500 msec after every notifyOfTyping(true) event', dispatch notifyOfTyping(false)
            // switchMap, by canceling any previous timer when a new one arises, ensures that
            // activity < 2500 msec apart will not dispatch notifyOfTyping(false)
            .switchMap(a => {
                return Rx.Observable.timer(2500)
                .map(() => ({
                    type: 'Activity.notifyOfTyping',
                    payload: false,
                    meta: { antares: { localOnly: true }}
                }))
            })
    }
}
