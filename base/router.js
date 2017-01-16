/* global document:false */
import React from 'react'
import { render } from 'react-dom'
import { Provider } from 'react-redux'
import { Route, Router, browserHistory } from 'react-router'
import { Meteor } from 'meteor/meteor'
import { LiveChat } from './LiveChat'
import { store } from './antares'

if (Meteor.isClient) {
    Meteor.startup(() => {
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
}
