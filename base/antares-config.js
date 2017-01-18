import { fromJS, List as IList } from 'immutable'
import { createReducer } from 'redux-act'
import { combineReducers } from 'redux-immutable'
import Rx from 'rxjs'

export { default as Actions } from './actions'

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
            return state.setIn(['isTyping', sender], active)
        }
        return state.deleteIn(['isTyping', sender])
    }
}, fromJS({ isTyping: {} }))

const ChatReducer = combineReducers({
    senders: sendersReducer,
    messages: messageReducer,
})

// A mapping from a given key such as ['Chats', 'chat:demo'], to a reducer to use.
// Very simple because it's our only object type.
export const ReducerForKey = () => ChatReducer

export const ViewReducer = combineReducers({
    viewingAs: createReducer({
        'View.changeSides': viewingAs => (viewingAs === 'Self' ? 'Other' : 'Self')
    }, 'Self'),
    activity: activityReducer
})

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
            // Selected actions
            .ofType('Activity.notifyOfTyping')
            .filter(a => a.payload.active === true)
            // become Observables which cancel any previous
            .switchMap(notifyOnAction =>
                // and which consist of the first of these to complete
                Rx.Observable.race(
                    Rx.Observable.timer(2500),
                    action$.ofType('Message.send')
                )
                // .. but turned into a notifyOfTyping({active: false}) action
                .map(() => ({
                    type: 'Activity.notifyOfTyping',
                    payload: {
                        active: false,
                        sender: notifyOnAction.payload.sender
                    }
                })))
}

export const MetaEnhancers = [
    () => ({ key: ['Chats', 'chat:demo'] })
]
