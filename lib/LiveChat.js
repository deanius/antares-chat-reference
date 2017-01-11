import React from 'react'
import { Map } from 'immutable'
import { connect } from 'react-redux'
// import not working - due to lib in Meteor perhaps? workaround is use global
// import { store, announce } from './antares'
import { Actions } from './antares-config'

// Given the senderId using this chat, returns a function which
// updates messages' sentByMe property
const markMyMessages = senderId =>
    messages => messages && messages.map((message) => {
        return message.set('sentByMe', (message.get('sender') === senderId))
    })

// Selects the slice of state to be shown in the UI, as a plain JS object
// The component props combine both antares data (shared for all clients)
// and view data, particular to each client
const selectState = (state) => {
    const viewData = state.view
    const iChatRoot = (state.antares.getIn(['Chats', 'chat:demo']) || new Map())
    return iChatRoot
        // modify the messages to have a flag
        .update('messages', markMyMessages(viewData.senderId))
        .set('senderId', viewData.senderId)
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
        // Tell React of the new value to render in the input
        this.setState({ inProgressMessage: event.target.value })

        // Announce one of these events (locally) on every change 
        Antares.announce(Actions.Activity.type, { sender: this.props.senderId })
    }

    handleSend() {
        this.props.sendChat(this.state.inProgressMessage, this.props.senderId)
        this.setState({ inProgressMessage: '' })
    }

    render() {
        let { senderId, messages = [], activity } = this.props
        return (
            <div>
                <h2>ANTARES chat
                    <span className="sm">
                        (viewing as {senderId})
                        &nbsp;
                        <a
                          href="#start-conversation" onClick={() => {
                                Antares.announce(Actions.Conversation.start, ['Self', 'Other'])
                                Antares.announce(Actions.Message.send, { message: 'Hello!', sender: 'Self' })
                                Antares.announce(Actions.Message.send, { message: 'Sup.', sender: 'Other' })
                                return false
                          }}
                        >Start conversation</a>
                        &nbsp;
                        <a
                          href="#change-sides" onClick={() => Antares.announce(Actions.View.changeSides) && false}
                        >See Other&apos;s View</a>
                    </span>
                </h2>
                <div className="messages">
                    {messages.map(msg => (
                        <div
                            key={Math.floor(Math.random() * 1000)}
                            className={'msg msg-' + (msg.sentByMe ? 'mine' : 'theirs')}
                            >{msg.message}</div>
                    ))}
                </div>

                {
                    // a compound expression evaluating to the typing indicator
                    // if all the conditions are met
                    activity &&
                    Object.keys(activity.activeSenders).length > 0 &&
                    !activity.activeSenders[senderId] &&
                    <div className="msg msg-theirs"><i>. . .</i></div>
                }

                <div className="inProgressMessage">
                    <textarea
                        rows="2" cols="50"
                        value={this.state.inProgressMessage}
                        onChange={this.handleTyping}
                        />
                    <br />
                    <button onClick={this.handleSend}>SEND</button>
                </div>
            </div>
        )
    }
}

export const LiveChat = connect(selectState, handlers)(_LiveChat)

