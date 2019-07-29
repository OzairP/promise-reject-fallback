import { withFallback } from './index'

const invariant = () => fail(Error('Invariant'))

describe('withFallback', () => {
	test('should return adhere to Promise contract', () => {
		const p = withFallback(() => Promise.resolve(), () => {})

		expect(p).toBeInstanceOf(Promise)
		expect(p.then).toBeDefined()
		expect(p.catch).toBeDefined()
		expect(p.finally).toBeDefined()
	})

	describe('same tick resolve/reject', () => {
		test('should apply fallback if none was provided in chain', done => {
			expect.assertions(1)

			const err = Error()
			const p = withFallback(
				() => Promise.reject(err),
				reason => {
					expect(reason).toBe(err)
					done()
				}
			)

			p.then(invariant)
		})

		test('should not apply fallback if one was supplied in chain', () => {
			const err = Error()
			const p = withFallback(() => Promise.reject(err), invariant)

			return expect(p).rejects.toBe(err)
		})

		test('should not reject if fulfilled', () => {
			const p = withFallback(() => Promise.resolve('ok'), invariant)

			return expect(p).resolves.toBe('ok')
		})

		test('should not apply fallback if rejection is handled later in chain', () => {
			const err = Error()
			const p = withFallback(() => Promise.reject(err), invariant)
				.then()
				.then()

			return expect(p).rejects.toBe(err)
		})

		test('should mimic Promise.finally behavior if rejected without catch', done => {
			expect.assertions(0)

			withFallback(() => Promise.reject(), () => {}).finally(done)
		})

		test('should mimic Promise.finally behavior if rejected with catch', done => {
			expect.assertions(0)

			withFallback(() => Promise.reject(), () => {})
				.catch(() => {})
				.finally(done)
		})

		test('should mimic Promise.finally behavior if resolved without catch', done => {
			expect.assertions(0)

			withFallback(() => Promise.resolve(), () => {}).finally(done)
		})

		test('should mimic Promise.finally behavior if resolved with catch', done => {
			expect.assertions(0)

			withFallback(() => Promise.resolve(), () => {})
				.catch(() => {})
				.finally(done)
		})
	})

	describe('async resolve/reject', () => {
		const resolve = (value?: any) =>
			new Promise(resolve => {
				setTimeout(resolve, 50, value)
			})
		const reject = (reason?: any) =>
			new Promise((_, reject) => {
				setTimeout(reject, 50, reason)
			})

		test('should apply fallback if none was provided in chain', done => {
			expect.assertions(1)

			const err = Error()
			const p = withFallback(
				() => reject(err),
				reason => {
					expect(reason).toBe(err)
					done()
				}
			)

			p.then(invariant)
		})

		test('should not apply fallback if one was supplied in chain', () => {
			const err = Error()
			const p = withFallback(() => reject(err), invariant)

			return expect(p).rejects.toBe(err)
		})

		test('should not reject if fulfilled', () => {
			const p = withFallback(() => resolve('ok'), invariant)

			return expect(p).resolves.toBe('ok')
		})

		test('should not apply fallback if rejection is handled later in chain', () => {
			const err = Error()
			const p = withFallback(() => reject(err), invariant)
				.then()
				.then()

			return expect(p).rejects.toBe(err)
		})

		test('should mimic Promise.finally behavior if rejected without catch', done => {
			expect.assertions(0)

			withFallback(() => reject(), () => {}).finally(done)
		})

		test('should mimic Promise.finally behavior if rejected with catch', done => {
			expect.assertions(0)

			withFallback(() => reject(), () => {})
				.catch(() => {})
				.finally(done)
		})

		test('should mimic Promise.finally behavior if resolved without catch', done => {
			expect.assertions(0)

			withFallback(() => resolve(), () => {}).finally(done)
		})

		test('should mimic Promise.finally behavior if resolved with catch', done => {
			expect.assertions(0)

			withFallback(() => resolve(), () => {})
				.catch(() => {})
				.finally(done)
		})
	})
})
