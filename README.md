# Antares Examples

## Developer Notes: 

This app needs a dependency on both the npm and Meteor packages of antares.

There's a symlink to a sibling directory called `antares` to pick up the 
meteor package. From that directory, run `npm link`, and from this directory
run `npm link antares`. 

Upon changes to antares npm code, run its tests, then `gulp build`, and the 
Meteor app will pick up changes.
