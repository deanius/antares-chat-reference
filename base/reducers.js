import { fromJS, List as IList } from 'immutable'
import { createReducer } from 'redux-act'
import { combineReducers } from 'redux-immutable'

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

export const ChatReducer = combineReducers({
    senders: sendersReducer,
    messages: messageReducer,
})

export const ViewReducer = combineReducers({
    viewingAs: createReducer({
        'View.changeSides': viewingAs => (viewingAs === 'Self' ? 'Other' : 'Self')
    }, 'Self'),
    activity: activityReducer
})
