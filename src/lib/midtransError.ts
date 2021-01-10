import { MidtransErrorOptions } from '../types/midtransError'

// ref: https://rclayton.silvrback.com/custom-errors-in-node-js

/**
 * Custom HTTP Error Class that also expose httpStatusCode, ApiResponse, rawHttpClientData
 * To expose more info for lib user
 */

export class MidtransError extends Error {
	public readonly name: string
	private readonly httpStatusCode?: number
	private readonly ApiResponse?: any
	private readonly rawHttpClientData?: any

	constructor({ ...options }: MidtransErrorOptions) {
		super(options.message)

		// Ensure the name of this error is the same as the class name
		this.name = this.constructor.name

		this.httpStatusCode = options.httpStatusCode
		this.ApiResponse = options.ApiResponse
		this.rawHttpClientData = options.rawHttpClientData

		// This clips the constructor invocation from the stack trace.
		Error.captureStackTrace(this, this.constructor)
	}
}
