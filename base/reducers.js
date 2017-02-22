import { fromJS, List as IList } from 'immutable'
import { createReducer } from 'redux-act'
import { combineReducers } from 'redux-immutable'
import { isInAgency } from 'meteor/deanius:antares'

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
    'Message.send': (msgs, message) => {
        if (message.message.match(/.*client error.*/i) &&
            isInAgency('client')) {
            throw new Error('User-forced client error')
        } else if (message.message.match(/.*server error.*/i) &&
            isInAgency('server')) {
            throw new Error('User-forced server error')
        } else if (message.message.match(/.*both error.*/i)) {
            throw new Error('User-forced error')
        }
        return msgs.push(fromJS(message))
    }
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
