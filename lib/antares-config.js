export const Actions = {
    Message: {
        send: ({ message }) => ({
            type: 'Message.send',
            payload: { message }
        })
    }
}
