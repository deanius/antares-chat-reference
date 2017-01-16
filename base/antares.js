import { AntaresMeteorInit, AntaresInit, inAgencyRun } from 'meteor/deanius:antares'
import * as AntaresConfig from './antares-config'

export const Antares = AntaresMeteorInit(AntaresInit)(AntaresConfig)
export const store = Antares.store
export const announce = Antares.announce

// Extend our global scope with Antares in client and server agencies
inAgencyRun('any', function() {
    Object.assign(this, {
        Antares,
        Actions: AntaresConfig
    })
})
