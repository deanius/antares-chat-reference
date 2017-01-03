import React from 'react'
import { fromJS, Map } from 'immutable'
import { connect, Provider } from 'react-redux'
// import not working - due to lib in Meteor perhaps? workaround is use global
// import { store, announce } from './antares'
import { Actions } from './antares-config'

const markMyMessages = senders => messages => messages && messages.map(message => {
    return message.set('sentByMe', (message.get('sender') === senders.get('selfID')))
})

const selectState = (state) => {
    const iChatRoot = (state.antares.get('chat:demo') || new Map)
    return iChatRoot
        .update('messages', markMyMessages(iChatRoot.get('senders')))
        .toJS()
}

// TODO provide all handlers with the sender argument in a DRY way
const handlers = () => ({
    sendChat: (message) => { Antares.announce(Actions.Message.send, { message, sender: 'UA2' }) }
})

const _LiveChat = ({ senders, messages=[], activity, sendChat }) => {
    return (
        <div>
        <h2>TODO implement chat</h2>
        <div className="messages">
        { messages.map(msg => (
            <div key={ Math.floor(Math.random() * 1000) }
                className={'msg msg-' + (msg.sentByMe ? 'mine' : 'theirs')}
                >{msg.message}</div>
        ))}
        </div>

        { activity && (activity.activeSenders.UA2 > 0) &&
            <div className='msg-theirs'><i>typing...</i></div>
        }

        <div>
            <button onClick={e => sendChat('FOO')}>SEND</button>
        </div>
        </div>
    )
}

export const LiveChat = connect(selectState, handlers)(_LiveChat)

