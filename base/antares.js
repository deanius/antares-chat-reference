import { AntaresMeteorInit, AntaresInit, inAgencyRun } from 'meteor/deanius:antares'
import { Meteor } from 'meteor/meteor'
import { Mongo } from 'meteor/mongo'
import * as AntaresConfig from './antares-config'

export const Antares = AntaresMeteorInit(AntaresInit)(AntaresConfig)
export const store = Antares.store
export const announce = Antares.announce

const Collections = {
    Chats: new Mongo.Collection('chats')
}

// Extend our global scope with Antares in client and server agencies
inAgencyRun('any', function() {
    Object.assign(this, {
        Antares,
        Actions: AntaresConfig.Actions,
        Collections
    })
})

const MongoRenderer = ({ mongoDiff }) => {
    // if (!mongoDiff) return
    let { id, collection, update, upsert, updateOp } = mongoDiff

    let MongoColl = Collections[collection]
    if (!MongoColl) throw new Error(`Collection ${collection} not found`)

    if (update) {
        MongoColl.update(
            { _id: id },
            updateOp,
            {
                upsert
            }
        )
    }
}

inAgencyRun('server', () => {
    // Antares.subscribeRenderer(Meteor.bindEnvironment(MongoRenderer), {
    Antares.subscribeRenderer(MongoRenderer, {
        mode: 'sync',
        xform: diff$ => diff$
            // .filter(({ mongoDiff }) => mongoDiff !== null)
    })

    Collections.Chats.find().observe({
        added: doc => console.log('DB (create)>', doc),
        changed: newDoc => console.log('DB (update)>', newDoc)
    })
})
