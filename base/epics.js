import Rx from 'rxjs'
import { isInAgency } from 'meteor/deanius:antares'

export default isInAgency('server') ? {} : {

    notifyOfTyping: action$ =>
        action$
            .ofType('Activity.type')
            .throttleTime(2000)
            .map(a => ({
                type: 'Activity.notifyOfTyping',
                payload: {
                    active: true,
                    sender: a.payload.sender
                }
            })),

    removeTypingNotification: action$ =>
        action$
            // Selected actions
            .ofType('Activity.notifyOfTyping')
            .filter(a => a.payload.active === true)
            // become Observables which cancel any previous
            .switchMap(notifyOnAction =>
                // and which consist of the first of these to complete                // .. but turned into a notifyOfTyping({active: false}) action
                // turned into a notifyOfTyping({active: false}) action
                Rx.Observable.race(
                    Rx.Observable.timer(2500),
                    action$.ofType('Message.send')
                ).map(() => ({
                    type: 'Activity.notifyOfTyping',
                    payload: {
                        active: false,
                        sender: notifyOnAction.payload.sender
                    },
                    // We dont need to send out these actions - each agent will run this
                    // epic, clearing its own indicator accordingly.
                    meta: { antares: { localOnly: true } }
                })))
}
