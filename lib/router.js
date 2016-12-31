import React from 'react'
import { render } from 'react-dom'
import { Provider } from 'react-redux'
import { Route, Router, browserHistory } from 'react-router'
import { LiveChat } from './LiveChat'

// HACK referring to global state cuz my imports aint workin'
// import { store } from './antares'
const store = Antares.store

Meteor.isClient && Meteor.startup(() => {
    render(
        <Provider store={store}>
            <Router history={browserHistory}>
                <Route path="/" component={ LiveChat } />
            </Router>
        </Provider>
        ,
        document.getElementById('react-root')
    )
})
