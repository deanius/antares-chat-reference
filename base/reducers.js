import { fromJS, List as IList } from 'immutable'
import { createReducer } from 'redux-act'
import { combineReducers } from 'redux-immutable'
import { isInAgency } from 'meteor/deanius:antares'

import { Meteor } from 'meteor/meteor'

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
        if (message.message.match(/.*server error.*/i) &&
            isInAgency('server')) {
            throw new Meteor.Error('User-forced server error')
        }
        
        return msgs.push(fromJS(message))
    },
    'Message.send.error': (msgs, err) => {
        let lastMsgIdx = msgs.size - 1
        return msgs.update(lastMsgIdx, (msg) => {
            return msg.set('error', err.message)
        })
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
