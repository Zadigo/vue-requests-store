# Vue Requests Store

A Vue project can contain many different APIs from different files in your project. To resolve this issue, the Vue Requests Store centralize your APIs in one place which make them much easier to call in your templates.

## How to install

Installing VueRequestStore is very easy. You need to create a plugin file in your plugins folder in src and do the following:

```javascript
import { createApiStore } from './vue-api'
import myAxios from './my-axios'

var api = createApiStore(null, {
  // Rest of code goes there
})
```
`createApiStore` takes two parameters: `client`, `options`. The client is the custom one that you intend to use in your project e.g. axios and the options are a list of requests to be stored in the store. Once you defined your client as so somewhere in your app:

```javascript
import axios from 'axios'

const client = axios.create({
    baseURL: 'https://jsonplaceholder.typicode.com/',
    timeout: 60 * 1000,
    headers: { 'Content-Type': 'application/json' },
    withCredentials: false
})

window.axios = client

export default client
```
The previous code becomes:

```javascript
import { createApiStore } from './vue-api'
import client from './my-custom-client'

var api = createApiStore(client, {
  // Rest of code goes there
})
```

## Registering your requests

The `options` parameter of `createApiStore` requires on root element `requests` which is an array of dicts which themselves require two main keys: `name` and `action`.

```javascript
var api = createApiStore(client, {
  requests: [
    {
      name: 'todos',
      action: (client, params) => {
        method: 'get',
        url: '/todos'
      }
    }
  ]
})
```
The action function takes two parameters: `client` and `params`. The client is the one you initially passed in `createApiStore` that will be used to make the calls. `params` are simply additional parameters passed from your template in order to complete the url for the call.

## Examples

### Sending a request without parameters

```html
<script>
export default {
  name: 'SomeComponent'
  methods: {
    testApi () {
      this.$api('todos')
      .then((response) => {
        // Rest of code
      })
      .catch((error) => {
        // Rest of code
      })
    }
  }
}
</script>
```

### Sending a request with parameters

```html
<script>
export default {
  name: 'SomeComponent'
  methods: {
    testApi () {
      this.$api('todos', { id: 1 })
      .then((response) => {
        // Rest of code
      })
      .catch((error) => {
        // Rest of code
      })
    }
  }
}
</script>
```

```javascript
var api = createApiStore(client, {
  requests: [
    {
      name: 'todos',
      action: (client, params) => {
        method: 'get',
        url: '/todos/${params.id}'
      }
    }
  ]
})
```

```javascript
var api = createApiStore(client, {
  requests: [
    {
      name: 'todos',
      action: (client, params) => {
        method: 'get',
        url: '/posts/1/comments',
        params: params
      }
    }
  ]
})
```
