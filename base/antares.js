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

inAgencyRun('server', () => {
    // Subscribe our Mongo Renderer in one of two styles

    // WITH an egregious Mongo delay
    Antares.subscribeRenderer(Meteor.bindEnvironment(MongoRenderer), {
        mode: 'async',
        xform: diff$ => diff$
            .filter(({ mongoDiff }) => mongoDiff !== null)
            .delay(3000)
    })

    // ALTERNATELY without optimistic persistence (no bindEnvironment needed)
    // Antares.subscribeRenderer(MongoRenderer, {
    //     mode: 'sync',
    //     xform: diff$ => diff$
    //         .filter(({ mongoDiff }) => mongoDiff !== null)
    // })

    // Bonus: Show us from the DB What actual changes have occurred
    Collections.Chats.find().observeChanges({
        added: (id, fields) => console.log(`DB (${id})>`, fields),
        changed: (id, fields) => console.log(`DB (${id})>`, fields)
    })
})
