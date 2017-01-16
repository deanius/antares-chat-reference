import React from 'react'
import { Map } from 'immutable'
import { connect } from 'react-redux'
import { announce } from './antares'
import Actions from './actions'

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
    const persistedChatData = (state.antares.getIn(['Chats', 'chat:demo']) || new Map())
    const currentSender = state.view.get('senderId')
    return persistedChatData
        // slightly dirty - modify the messages to have a flag
        .update('messages', markMyMessages(currentSender))
        .merge({
            senderId: currentSender,
            activeSenders: state.view.getIn(['activity', 'activeSenders'])
        })
        .toJS()
}

// TODO provide all handlers with the sender argument in a DRY way
const handlers = () => ({
    sendChat: (message, sender) => { announce(Actions.Message.send, { message, sender }) }
})

class _LiveChat extends React.Component {
    constructor(props) {
        super(props)
        this.state = { inProgressMessage: '' }
        this.handleTyping = this.handleTyping.bind(this)
        this.handleSend = this.handleSend.bind(this)
        this.handleKeyPress = this.handleKeyPress.bind(this)
    }

    handleKeyPress(event) {
        if (event.key === 'Enter') {
            event.preventDefault()
            this.handleSend()
        }
    }

    handleTyping(event) {
        // Tell React of the new value to render in the input
        this.setState({ inProgressMessage: event.target.value })

        // Announce one of these events (locally) on every change
        announce(Actions.Activity.type, { sender: this.props.senderId })
    }

    handleSend() {
        this.props.sendChat(this.state.inProgressMessage, this.props.senderId)
        this.setState({ inProgressMessage: '' })
    }

    render() {
        let { senderId, messages = [], activeSenders } = this.props
        return (
            <div>
                <h2>ANTARES chat</h2>
                <div className="sm">
                    <a
                      href="#start-conversation" onClick={(e) => {
                          announce(Actions.Conversation.start, ['Self', 'Other'])
                          announce(Actions.Message.send, { message: 'Hello!', sender: 'Self' })
                          announce(Actions.Message.send, { message: 'Sup.', sender: 'Other' })
                          e.preventDefault()
                      }}
                    >Start conversation</a>
                    &nbsp;
                    <a
                      href="#change-sides"
                      onClick={(e) => {
                          announce(Actions.View.changeSides)
                          e.preventDefault()
                      }}
                    >See Other&apos;s View</a>
                    &nbsp;
                    (viewing as {senderId})
                </div>

                <div className="messages">
                    {messages.map(msg => (
                        <div
                          key={Math.floor(Math.random() * 10000)}
                          className={'msg msg-' + (msg.sentByMe ? 'mine' : 'theirs')}
                        >{msg.message}</div>
                    ))}
                </div>

                {
                    // a compound expression evaluating to the typing indicator
                    // if all the conditions are met
                    activeSenders &&
                    Object.keys(activeSenders).length > 0 &&
                    !activeSenders[senderId] &&
                    <div className="msg msg-theirs"><i>. . .</i></div>
                }

                <div className="inProgressMessage">
                    <textarea
                      rows="2" cols="50"
                      value={this.state.inProgressMessage}
                      onChange={this.handleTyping}
                      onKeyPress={this.handleKeyPress}
                    />
                    <br />
                    <button onClick={this.handleSend}>SEND</button>
                </div>
            </div>
        )
    }
}

export const LiveChat = connect(selectState, handlers)(_LiveChat)

