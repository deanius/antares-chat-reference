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
        type: ({ sender }) => ({
            type: 'Activity.type',
            payload: { sender },
            meta: { antares: { localOnly: true }}
        }),
        notifyOfTyping: ({ active, sender }) => ({
            type: 'Activity.notifyOfTyping',
            payload: { active, sender }
        })
    },
    Senders: {
        changeSides: () => ({
            type: 'Senders.changeSides',
            meta: { antares: { localOnly: true }}
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

const sendersReducer = createReducer({
    'Senders.changeSides': (state) => {
        let otherID = state.get('otherID')
        let selfID = state.get('selfID')
        return state
            .set('selfID', otherID)
            .set('otherID', selfID)
    }
}, fromJS({ selfID: 'UA2', otherID: 'UA1' }))

const messageReducer = createReducer({
    'Message.send': (msgs, message) => msgs.push(fromJS(message))
}, new iList())

const activityReducer = createReducer({
    'Activity.notifyOfTyping': (state, { active, sender }) => {
        if (active)
            return state.setIn(['activeSenders', sender], active )
        else
            return state.deleteIn(['activeSenders', sender])
    }
}, fromJS({ activeSenders: {}}))

export const Reducers = {
    Conversation: combineReducers({
        senders: sendersReducer,
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
            .map(a => createConsequence(a, {
                type: 'Activity.notifyOfTyping',
                payload: {
                    active: true,
                    sender: a.payload.sender
                }
            }))
    },
    removeTypingNotification: (action$, state) => {
        return action$
            .ofType('Activity.notifyOfTyping')
            .filter(a => a.payload.active === true)
            // '2500 msec after every notifyOfTyping(true) event', dispatch notifyOfTyping(false)
            // switchMap, by canceling any previous timer when a new one arises, ensures that
            // activity < 2500 msec apart will not dispatch notifyOfTyping(false)
            .switchMap(beganTypingAction => {
                return Rx.Observable.race(
                    Rx.Observable.timer(2500),
                    action$.ofType('Message.send')
                ).map(() => createConsequence(beganTypingAction, {
                    type: 'Activity.notifyOfTyping',
                    payload: {
                        active: false,
                        sender: beganTypingAction.payload.sender
                    },
                    meta: { antares: { localOnly: true }}
                }))
            })
    }
}
