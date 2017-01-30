import { AntaresMeteorInit, AntaresInit, inAgencyRun } from 'meteor/deanius:antares'
import { Meteor } from 'meteor/meteor'
import { Mongo } from 'meteor/mongo'
import * as AntaresConfig from './antares-config'

export const Antares = AntaresMeteorInit(AntaresInit)(AntaresConfig)
export const store = Antares.store
export const announce = Antares.announce
const mongoRendererFor = Antares.mongoRendererFor

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
    Antares.subscribeRenderer(mongoRendererFor(Collections), {
        mode: 'async',
        xform: diff$ => diff$
            .filter(({ mongoDiff }) => mongoDiff !== null)
            .delay(3000)
    })

    // ALTERNATELY without optimistic persistence
    // Antares.subscribeRenderer(mongoRendererFor(Collections), {
    //     mode: 'sync',
    //     xform: diff$ => diff$
    //         .filter(({ mongoDiff }) => mongoDiff !== null)
    // })
})

inAgencyRun('client', () => {
    // Nothing happens until we subscribe!
    Antares.subscribe('*')
})