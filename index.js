/*
    Simple store that allows a user to
    register all his request APIs
*/ 

import { setupDevtools } from "./devtools"

var checkRequest = function (requestOptions) {
    // Checks that a dict from the requests
    // options have at least name and action
    // { name: ..., action... }
    if (typeof requestOptions['name'] === 'undefined') {
        // Raise error?
        throw new Error('Each requests from the VueAPIStore should define a name')
    }

    if (typeof requestOptions['action'] === 'undefined') {
        // Raise error?
        throw new Error(`Request with name '${requestOptions['name']}' from the VueAPIStore does not define an action`)
    }
    
    if (typeof requestOptions['action'] !== 'function') {
        // Raise error?
        throw new Error(`Request action with name '${requestOptions['name']}' should be a function that receives 'client' and 'params' as parameters`)
    }
}

var getClients = function(options) {
    // Options should be a dict with a requests
    // key that returns dicts of type 
    // { name: ..., action: ... }
    var clients = options.requests

    if (typeof clients == 'undefined') {
        return []
    }

    if (typeof clients !== 'object') {
        // raise error?
    }
    
    clients.forEach((item) => {
        checkRequest(item)
    })
    // This returns an array
    return clients
}

class apiStore {
    constructor(client, options) {
        // The user can use his custom client
        // to make the requests. However, if this
        // not the case raise en error or create
        // our own custom client?
        if (typeof client == 'undefined') {
            // raise error
        }

        this._axios = client
        this._options = options
        this._vueOptions = {}
        this._clients = getClients(options)

        this._history = []
    }

    get lastRequest() {
        return this._history[this._history.length - 1]
    }

    runAction(name, params) {
        // Get an action and return
        // the underlying axios client
        if (typeof params == 'undefined') {
            params = Object.create(null)
        }

        var candidates = this._clients.filter((client) => {
            return client.name === name
        })

        if (candidates.length > 0) {
            var client = candidates[0]
            var action = client.action
            // TODO: Check if it is good solution to
            // keep track of the requests that were
            // sent or used by the app
            this._history.push(client['name'])
            // TODO: Find a way to generate error if
            // action does not return the result of 
            // axios, http...
            return action(this._axios, params)
        } else {
            // Inform the user that no request was sent and that
            // the request was not found in the store
        }
    }

    install(app, options) {
        var self = this
        var devtools = setupDevtools(app, self)

        // TODO: How to implement the options
        // that come from .use(api, {})?
        self._vueOptions = options

        app.mixin({
            methods: {
                // TODO: Put functionnality so that
                // the user can send multiple requests?
                $api(name, params) {
                    // data -> for post methods
                    // params -> for get methods
                    // data and params allows us to pass extra
                    // elements from the template to the store
                    // from Vue template e.g. ids, slugs, titles...

                    var result = self.runAction(name, params)
                    var trackEnd = devtools ? devtools.trackStart('$api') : null
                    return new Promise(resolve => {
                        if (trackEnd) {
                            trackEnd()
                        }
                        resolve(result)
                    })
                    // return result
                }
            }
        })

        // app.config.globalProperties.$api = {}
    }

    register(name, action) {
        // Allows the user to register a single request
        var requestBody = { name: name, action: action }
        checkRequest(requestBody)
        this._clients.push(requestBody)
    }

    // beforeSend() {}
    
    // afterSendComplete(func) {
    //     // A callback that can be executed
    //     // by the user once the request has executed.
    //     // NOTE: This does not give access to the response
    //     // of the request 
    //     if (typeof func != 'function') {
    //         // raise error?
    //     }

    //     var lastRequest = this._history[this._history.length - 1]
    //     if (typeof lastRequest != 'undefined') {
    //         let { name, action } = lastRequest
    //         return func(name, action)
    //     } else {
    //         return func('', {})
    //     }
    // }
}

function createApiStore(client, options) {
    // Base entrypoint for creating the API Store.
    // The user MUST pass the client that he wants
    // to use in order to make the requests. The options
    // define requests names and actions that he wants
    // to send via the template
    return new apiStore(client, options)
}

export {
    createApiStore
}
