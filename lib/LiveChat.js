import React from 'react'
import { Map } from 'immutable'
import { connect } from 'react-redux'
// import not working - due to lib in Meteor perhaps? workaround is use global
// import { store, announce } from './antares'
import { Actions } from './antares-config'

// Given the senders (self, other), returns a function which
// updates messages setting their sentByMe property
const markMyMessages = senders =>
    messages => messages && messages.map((message) => {
        return message.set('sentByMe', (message.get('sender') === senders.get('selfID')))
    })

// Selects the slice of state to be shown in the UI, as a plain JS object
const selectState = (state) => {
    const iChatRoot = (state.antares.getIn(['Chats', 'chat:demo']) || new Map())
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
        // Tell React of the new value to render in the input
        this.setState({ inProgressMessage: event.target.value })

        // Announce one of these events (locally) on every change 
        Antares.announce(Actions.Activity.type, { sender: this.props.senders.selfID })
    }

    handleSend() {
        this.props.sendChat(this.state.inProgressMessage, this.props.senders.selfID)
        this.setState({ inProgressMessage: '' })
    }

    render() {
        let { senders, messages = [], activity } = this.props
        return (
            <div>
                <h2>ANTARES chat</h2>
                <div>
                    <a
                      href="#start-conversation" onClick={() => {
              // While these return promises, we don't need to chain with 'then'
                          Antares.announce(Actions.Conversation.start, { selfID: 'UA1', otherID: 'UA2' })
                          Antares.announce(Actions.Message.send, { message: 'Hello!', sender: 'UA1' })
                          Antares.announce(Actions.Message.send, { message: 'Sup.', sender: 'UA2' })
                          return false
                      } }
                    >
            Start conversation
            </a>
            &nbsp;
                    <a href="#change-sides" onClick={() => Antares.announce(Actions.Senders.changeSides) && false}>
                See Other&apos;s View
            </a>
                </div>
                <div className="messages">
                    { messages.map(msg => (
                        <div
                          key={ Math.floor(Math.random() * 1000) }
                          className={'msg msg-' + (msg.sentByMe ? 'mine' : 'theirs')}
                        >{msg.message}</div>
        ))}
                </div>

                { activity && (activity.activeSenders[senders.otherID]) && 
                <div className="msg-theirs"><i>typing...</i></div>
        }

                <div>
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

