import { AntaresMeteorInit } from 'meteor/deanius:antares'
import { AntaresInit } from 'antares'
import * as AntaresConfig from './antares-config'

export const Antares = AntaresMeteorInit(AntaresInit)(AntaresConfig)

Meteor.isClient && Object.assign(window, Antares)
