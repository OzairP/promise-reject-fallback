# Promise Reject Fallback

[![Greenkeeper badge](https://badges.greenkeeper.io/OzairP/promise-reject-fallback.svg)](https://greenkeeper.io/)

![Build Status](https://travis-ci.com/OzairP/use-promise-reject-fallback.svg?branch=master)

## Problem

You want to add a rejection handler to a Promise but you only want it to run if the consumer
doesn't handle your promise rejection.

Example:

```typescript
import axios from 'axios'

const fetchPosts = () => axios.get('/posts').catch(error => alert(error))

// Page 1
fetchPosts.then(posts => console.log(posts))

// Page 2
fetchPosts.then(posts => console.log(posts)).catch(error => showDialog(error))
```

You have a error handler on fetchPosts to globally handle an error, in this case we use alert.
This is great for Page 1 because we have a generic way of handling and displaying errors!
This is not great for Page 2 because now we have duplicated error handling, our catch handler
in `fetchPosts` handles the rejection, but so does Page 2.

The `withFallback` will decorate your Promise and allow you to add a fallback rejection handler
only if one wasn't added later in the chain.

```typescript
import axios from 'axios'
import { withFallback } from 'promise-reject-fallback'

const fetchPosts = () =>
	withFallback(() => axios.get('/posts'), error => alert(error))

// Page 1, alert Error!
fetchPosts.then(posts => console.log(posts))

// Page 2, dialog with Error!
fetchPosts.then(posts => console.log(posts)).catch(error => showDialog(error))
```
