type Maybe<T> = T | null

/**
 * Return the callback result as a promise deferred to when the engine is idle
 */
function defer<T>(fun: (reject: (reason?: any) => any) => T): Promise<T> {
	return new Promise((resolve, reject) =>
		(setImmediate || setTimeout)(() => resolve(fun(reject)))
	)
}

/**
 * Return a decorated Promise that will catch the promise returned from
 * promiseFactory with fallbackRejectionHandler if no other .catch handler was
 * applied later in the Promise chain
 */
export function withFallback<T>(
	promiseFactory: () => Promise<T>,
	fallbackRejectionHandler: NonNullable<Parameters<Promise<T>['catch']>[0]>
): Promise<T> {
	let fallbackEnabled = true

	// This is what first handles the rejected promise, it then defers it to
	// fallbackRejectionHandler if fallback is disabled. If not, meaning a catch
	// was supplied later in the chain, we reject to the next catch
	const promise = promiseFactory().catch(reason =>
		// Defer calling the rejection handler in case the Promise rejection occurs
		// in the same iteration of the event loop. If that happens the engine
		// does not immediately go idle after the Promise is constructed
		// so any future .catch calls from the consumer would be applied
		// *after* the Promise had already been rejected.
		defer<T>(reject =>
			fallbackEnabled ? fallbackRejectionHandler(reason) : reject(reason)
		)
	)

	return new (class FallbackPromise extends Promise<T> {
		then<TResult1 = T, TResult2 = never>(
			onFulfilled?: Maybe<(value: T) => TResult1 | PromiseLike<TResult1>>,
			onRejected?: Maybe<
				(reason: any) => TResult2 | PromiseLike<TResult2>
			>
		): Promise<TResult1 | TResult2> {
			// .then returns a new promise which could chain a .catch, so we have to
			// disable this FallbackPromise and wrap another one on the promise
			// returned from .then
			fallbackEnabled = false
			const handledPromise = promise.then(onFulfilled)
			return onRejected
				? // If they passed a rejection handler then we know they are handling it
				  handledPromise.catch(onRejected)
				: // If not, we wrap the new returned promise with the fallback decorator
				  withFallback(() => handledPromise, fallbackRejectionHandler)
		}

		finally(onFinally?: Maybe<() => void>): Promise<T> {
			return promise.finally(onFinally)
		}

		catch<TResult = never>(
			onRejected?: Maybe<(reason: any) => TResult | PromiseLike<TResult>>
		): Promise<T | TResult> {
			// If they are handling the promise we can disable fallback
			if (onRejected) {
				fallbackEnabled = false
			}
			return promise.catch(onRejected)
		}
	})(() => {})
}
