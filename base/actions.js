export default {
    Chat: {
        start: () => ({
            type: 'Antares.store',
            payload: { senders: ['Self', 'Other'] }
        }),
        // An action of interest to our S3Renderer
        archive: () => ({
            type: 'Chat.archive.begin'
        })
    },
    Message: {
        send: ({ message, sender }) => ({
            type: 'Message.send',
            payload: {
                message,
                sender,
                // Since the user cares about sentAt it's payload, not simply metadata
                sentAt: new Date()
            }
        })
    },
    Activity: {
        type: ({ sender }) => ({
            type: 'Activity.type',
            payload: { sender },
            meta: { antares: { localOnly: true } }
        }),
        notifyOfTyping: ({ active, sender }) => ({
            type: 'Activity.notifyOfTyping',
            payload: { active, sender }
        })
    },
    View: {
        changeSides: () => ({
            type: 'View.changeSides',
            meta: { antares: { localOnly: true } }
        })
    }
}
