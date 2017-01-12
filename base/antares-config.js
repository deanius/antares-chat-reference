import { fromJS, List as IList } from 'immutable'
import { createReducer } from 'redux-act'
import { combineReducers } from 'redux-immutable'
import Rx from 'rxjs'
import { createConsequence } from 'meteor/deanius:antares'

export const Actions = {
    Conversation: {
        start: (participants) => ({
            type: 'Antares.storeAtKey',
            payload: { senders: participants }
        })
    },
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
            meta: { antares: { localOnly: true } }
        }),
        notifyOfTyping: ({ active, sender }) => ({
            type: 'Activity.notifyOfTyping',
            payload: { active, sender }
        })
    },
    View: {
        changeSides: () => ({
            type: 'View.changeSides',
            meta: { antares: { localOnly: true } }
        })
    },
}

const sendersReducer = createReducer({
    'Senders.changeSides': (state) => {
        let otherID = state.get('otherID')
        let selfID = state.get('selfID')
        return state
            .set('selfID', otherID)
            .set('otherID', selfID)
    }
}, fromJS(['Self', 'Other']))

const messageReducer = createReducer({
    'Message.send': (msgs, message) => msgs.push(fromJS(message))
}, new IList())

const activityReducer = createReducer({
    'Activity.notifyOfTyping': (state, { active, sender }) => {
        if (active) {
            return state.setIn(['activeSenders', sender], active)
        }
        return state.deleteIn(['activeSenders', sender])
    }
}, fromJS({ activeSenders: {} }))

export const Reducers = {
    Conversation: combineReducers({
        senders: sendersReducer,
        messages: messageReducer,
        activity: activityReducer
    })
}

export const ViewReducer = createReducer({
    'View.changeSides': view => ({ senderId: (view.senderId === 'Self' ? 'Other' : 'Self') })
}, { senderId: 'Self' })

export const Epics = {
    notifyOfTyping: action$ =>
        action$
            .ofType('Activity.type')
            .throttleTime(2000)
            .map(a => ({
                type: 'Activity.notifyOfTyping',
                payload: {
                    active: true,
                    sender: a.payload.sender
                }
            })),

    removeTypingNotification: action$ =>
        action$
            .ofType('Activity.notifyOfTyping')
            .filter(a => a.payload.active === true)
            .switchMap(typingOnAction =>
                Rx.Observable.race(
                    Rx.Observable.timer(2500),
                    action$.ofType('Message.send')
                ).map(() => createConsequence(typingOnAction, {
                    type: 'Activity.notifyOfTyping',
                    payload: {
                        active: false,
                        sender: typingOnAction.payload.sender
                    } })))
}

export const MetaEnhancers = [
    () => ({ key: ['Chats', 'chat:demo'] })
]

export const ReducerForKey = () => Reducers.Conversation
