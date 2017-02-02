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

    // clean slate
    Antares.announce({
        type: 'Antares.forget',
        meta: { antares: { key: ['Chats', 'chat:demo'] } }
    })
})

inAgencyRun('server', () => {
    // Subscribe our Mongo Renderer in one of two styles

    // WITH a hypothetical Mongo delay
    Antares.subscribeRenderer(mongoRendererFor(Collections), {
        mode: 'async',
        xform: diff$ => diff$
            .filter(({ mongoDiff }) => mongoDiff !== null)
            .delay(300)
    })

    // DEMO only: simulate network latency
    Antares.subscribeRenderer(Meteor.bindEnvironment(() => {
        Promise.await(new Promise(resolve => setTimeout(resolve, 100)))
    }))

    // ALTERNATELY non-blocking synchronous wait.
    // Exceptions *will* blow the stack.
    //
    // Antares.subscribeRenderer(mongoRendererFor(Collections), {
    //     mode: 'sync',
    //     xform: diff$ => diff$
    //         .filter(({ mongoDiff }) => mongoDiff !== null)
    // })
})

inAgencyRun('client', () => {
    // Nothing happens until we subscribe!
    Antares.subscribe({
        key: ['Chats'] // ['Chats', 'chat:demo']
    })
})