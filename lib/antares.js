import { AntaresMeteorInit } from 'meteor/deanius:antares'
import { AntaresInit, inAgencyRun } from 'antares'
import * as AntaresConfig from './antares-config'

export const Antares = AntaresMeteorInit(AntaresInit)(AntaresConfig)

// Extend our global scope with Antares in client and server agencies
inAgencyRun('any', function() {
    Object.assign(this, Antares)
})
