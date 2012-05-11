### The Big Bumper

Let's build the entire bump capability as a separate open source project so other people can use it for other projects.

Basically it consists of a server and client libs (for any platform we need, _phonegap_ will probably be first...). 
The client library simply sends a payload via a request to the server and receives any payload(s?) and a session id that were sent by other devices on the same timeframe on the same geo-location. A timeout indicates that there is no bump.

Payloads should be a promised input (pass a function that calculates the payload).

Not secure and not private but I think it will work.

### Client Apps

The app requires facebook login. When logged in, it queries the graph for the user's friends list and stores it in-memory (refresh on app activation).

It starts the bump library so that when a bump occurs the list of friend IDs will be sent to the other side. The response (if not timed out) is the friend IDs of the other side and they are matched in-memory in against the local friend IDs and the common friends are displayed. Yey!

### Stack

__Frontend__: I think we should try to create the clients using phonegap/HTML and not native shit. This way we will be able to publish it in multiple platforms without too much extra work (hopefully). _What do you think?_

__Backends__: Anything that talks HTTP and does not require build, preferability node.js