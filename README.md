```typescript
import { withFallback } from 'use-promise-reject-fallback'

const apiReq = async () => {
	throw Error('error1')
}

const doReq = () =>
	withFallback(apiReq(), e => {
		console.error('doReq', e)
	})

const p = doReq()

p.then(console.log)
	.catch(e => {
		console.error('main', e)
	})
```
