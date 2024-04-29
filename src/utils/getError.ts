import { NoErrorThrownError } from '../lib/noErrorThrown'

export const getError = async <TError>(call: () => unknown): Promise<TError> => {
	try {
		await call()

		throw new NoErrorThrownError()
	} catch (error: unknown) {
		return error as TError
	}
}
