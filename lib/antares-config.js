export const Actions = {
    Message: {
        send: ({ message }) => ({
            type: 'Message.send',
            payload: { message }
        })
    },
    Conversation: {
        start: ({ selfID, otherID }) => ({
            type: 'Antares.storeAtKey',
            payload: { senders: { selfID, otherID } },
            meta: { antares: { key: 'chat:demo' } }
        })
    }
}

export const MetaEnhancers = [
]
