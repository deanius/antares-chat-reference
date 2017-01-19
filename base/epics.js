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
                // and which consist of the first of these to complete
                Rx.Observable.race(
                    Rx.Observable.timer(2500),
                    action$.ofType('Message.send')
                )
                    // .. but turned into a notifyOfTyping({active: false}) action
                    .map(() => ({
                        type: 'Activity.notifyOfTyping',
                        payload: {
                            active: false,
                            sender: notifyOnAction.payload.sender
                        }
                    })))
}
