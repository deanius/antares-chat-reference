import React from 'react'
import { fromJS, Map } from 'immutable'
import { connect, Provider } from 'react-redux'
import { store } from './antares'


const markMyMessages = senders => messages => messages && messages.map(message => {
    return message.set('sentByMe', (message.get('sender') === senders.get('selfID')))
})

const selectState = (state) => {
    const iChatRoot = (state.antares.get('chat:demo') || new Map)
    return iChatRoot
        .update('messages', markMyMessages(iChatRoot.get('senders')))
        .toJS()
}

const handlers = () => ({
    sendChat: () => { console.log('TODO dispatch event')}
})

const _LiveChat = ({ senders, messages=[] }) => {
    return (
        <div className="messages flexcont">
        <h2>TODO implement chat</h2>
        { messages.map(msg => (
            <div className={'msg msg-' + (msg.sentByMe ? 'mine' : 'theirs')}>{msg.message}</div>
        ))}
        </div>
    )
}

export const LiveChat = connect(selectState, handlers)(_LiveChat)

