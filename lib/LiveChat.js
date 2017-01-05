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
    sendChat: (message, sender) => { Antares.announce(Actions.Message.send, { message, sender }) }
})

class _LiveChat extends React.Component {
    constructor(props) {
        super(props)
        this.state = { inProgressMessage: '' }
        this.handleTyping = this.handleTyping.bind(this)
        this.handleSend = this.handleSend.bind(this)
    }

    handleTyping(event) {
        this.setState({ inProgressMessage: event.target.value })
        Antares.announce(Actions.Activity.type, { sender: this.props.senders.selfID })
    }

    handleSend() {
        this.props.sendChat(this.state.inProgressMessage, this.props.senders.selfID)
        this.setState({ inProgressMessage: '' })
    }

    render() {
        let { senders, messages=[], activity, sendChat } = this.props
        return (
        <div>
        <h2>ANTARES chat</h2>
        <div className="messages">
        { messages.map(msg => (
            <div key={ Math.floor(Math.random() * 1000) }
                className={'msg msg-' + (msg.sentByMe ? 'mine' : 'theirs')}
                >{msg.message}</div>
        ))}
        </div>

        { activity && (activity.activeSenders[senders.otherID]) &&
            <div className="msg-theirs"><i>typing...</i></div>
        }

        <div>
            <textarea rows="2" cols="50" type="text" value={this.state.inProgressMessage} onChange={this.handleTyping} />
            <br/>
            <button onClick={this.handleSend}>SEND</button>
        </div>
        </div>
    )}
}

export const LiveChat = connect(selectState, handlers)(_LiveChat)

