import React from 'react'
import { render } from 'react-dom'
import { Provider } from 'react-redux'
import { Route, Router, browserHistory } from 'react-router'

const LiveChat = (props) => (<h2>TODO implement chat</h2>)

Meteor.isClient && Meteor.startup(() => {
    // TODO render a full chess position
    render(
        <LiveChat/>
        ,
        document.getElementById('react-root')
    )
})
