import { AntaresMeteorInit, AntaresInit, inAgencyRun } from 'meteor/deanius:antares'
import * as AntaresConfig from './antares-config'

export const Antares = AntaresMeteorInit(AntaresInit)(AntaresConfig)

// Extend our global scope with Antares in client and server agencies
inAgencyRun('any', function() {
    Object.assign(this, Antares)
})
