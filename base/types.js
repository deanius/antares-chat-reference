import { SimpleSchema } from 'meteor/aldeed:simple-schema'

const sendMessage = new SimpleSchema({
    message: {
        type: String,
        min: 2
    },
    sender: {
        type: String
    },
    sentAt: {
        type: Date
    }
})

const viewCreationSchema = new SimpleSchema({
    userId: {
        type: String
    },
    creationId: {
        type: String
    }
})

const viewersSchema = new SimpleSchema({
    creationId: {
        type: String
    },
    viewers: {
        type: Object,
        blackbox: true
        /*
            What SimpleSchema won't let me say is:
              - Keys are userId strings, values are truthy
        */
    }
})

export default {
    'Message.send': sendMessage.validator(),
    'View.joinedCreation': viewCreationSchema.validator(),
    'View.leftCreation': viewCreationSchema.validator(),
    'View.setCreationViewers': viewersSchema.validator()
}
