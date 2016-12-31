import React from 'react'
import { Map } from 'immutable'
import { connect, Provider } from 'react-redux'
import { store } from './antares'

const selectState = (state) => (state.antares.get('chat:demo') || new Map).toJS()
const handlers = () => ({
    sendChat: () => { console.log('TODO dispatch event')}
})

const _LiveChat = ({ senders, messages=[] }) => {
    return (
        <div>
        <h2>TODO implement chat</h2>
        { messages.map(msg => (
            <div>{msg.message}</div>
        ))}
        </div>
    )
}

export const LiveChat = connect(selectState, handlers)(_LiveChat)

