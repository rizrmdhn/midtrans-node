import { isType } from 'is-any-type'
import { Iris } from '../src/lib/iris'
import { config } from '../config'
import { MidtransError } from '../src/lib/midtransError'
import { getError } from '../src/utils/getError'

let globVar = {
	createdRefNo: ''
}

describe('Iris.js', () => {
	let iris

	beforeEach(() => {
		jest.resetAllMocks()
		jest.setTimeout(50000)
		iris = new Iris(generateConfig())
	})

	afterAll(() => {
		jest.clearAllMocks()
		jest.clearAllTimers()
	})

	it('class should be working', () => {
		expect(iris instanceof Iris).toBeTruthy()
		expect(iris.ping).toBeInstanceOf(Function)
		expect(iris.createBeneficiaries).toBeInstanceOf(Function)
		expect(iris.updateBeneficiaries).toBeInstanceOf(Function)
		expect(iris.getBeneficiaries).toBeInstanceOf(Function)
		expect(iris.createPayouts).toBeInstanceOf(Function)
		expect(iris.approvePayouts).toBeInstanceOf(Function)
		expect(iris.rejectPayouts).toBeInstanceOf(Function)
		expect(iris.getPayoutDetails).toBeInstanceOf(Function)
		expect(iris.getTransactionHistory).toBeInstanceOf(Function)
		expect(iris.getTopupChannels).toBeInstanceOf(Function)
		expect(iris.getBalance).toBeInstanceOf(Function)
		expect(iris.getFacilitatorBankAccounts).toBeInstanceOf(Function)
		expect(iris.getFacilitatorBalance).toBeInstanceOf(Function)
		expect(iris.getBeneficiaryBanks).toBeInstanceOf(Function)
		expect(iris.validateBankAccount).toBeInstanceOf(Function)
		expect(isType(iris.apiConfig.get().serverKey)).toStrictEqual('string')
	})

	it('able to re-set serverKey via setter', () => {
		const spyIris = jest.spyOn(iris.apiConfig, 'set')
		iris.apiConfig.set({ serverKey: '' })
		expect(spyIris).toHaveBeenCalled()
		expect(spyIris).toHaveBeenCalledTimes(1)
		expect(iris.apiConfig.get().isProduction).toBeFalsy()
		expect(iris.apiConfig.get().serverKey).toStrictEqual('')
		iris.apiConfig.set({ serverKey: config.irisApiKey })
		expect(iris.apiConfig.get().serverKey).toStrictEqual(config.irisApiKey)
	})

	it('able to re-set serverKey via property', () => {
		const spyIris = jest.spyOn(iris.apiConfig, 'get')
		iris.apiConfig.get()
		expect(spyIris).toHaveBeenCalled()
		expect(spyIris).toHaveBeenCalledTimes(1)
		expect(iris.apiConfig.get().isProduction).toBeFalsy()
		iris.apiConfig.serverKey = ''
		expect(iris.apiConfig.get().serverKey).toStrictEqual('')
		iris.apiConfig.serverKey = config.irisApiKey
		expect(iris.apiConfig.get().serverKey).toStrictEqual(config.irisApiKey)
	})

	it('able to ping with correct api key', async () => {
		const spyIris = jest.spyOn(iris, 'ping')
		const res = await iris.ping()
		expect(spyIris).toHaveBeenCalled()
		expect(spyIris).toHaveBeenCalledTimes(1)
		expect(isType(res)).toStrictEqual('string')
		expect(res).toStrictEqual('pong')
	})

	it('fail 401 to createBeneficiaries with unset api key', async () => {
		let newIris = new Iris(generateWithoutApiKey())
		const spyIris = jest.spyOn(newIris, 'createBeneficiaries')
		const error = await getError<MidtransError>(() => newIris.createBeneficiaries({}))

		expect(spyIris).toHaveBeenCalled()
		expect(spyIris).toHaveBeenCalledTimes(1)
		expect(error.message).toMatch(/401/)
	})

	it('fail to createBeneficiaries: account duplicated / already been taken', async () => {
		const spyIris = jest.spyOn(iris, 'createBeneficiaries')
		const error = await getError<MidtransError>(() =>
			iris.createBeneficiaries({
				name: 'Budi Susantoo',
				account: '0611101146',
				bank: 'bca',
				alias_name: 'budisusantoo',
				email: 'budi.susantoo@example.com'
			})
		)

		expect(spyIris).toHaveBeenCalled()
		expect(spyIris).toHaveBeenCalledTimes(1)
		expect(error.message).toMatch(/400/)
	})

	it('able to updateBeneficiaries with existing/created account', async () => {
		const spyIris = jest.spyOn(iris, 'updateBeneficiaries')
		const res = await iris.updateBeneficiaries('budisusantoo', {
			name: 'Budi Susantoo',
			account: '0611101141',
			bank: 'bca',
			alias_name: 'budisusantoo',
			email: 'budi.susantoo@example.com'
		})
		expect(spyIris).toHaveBeenCalled()
		expect(spyIris).toHaveBeenCalledTimes(1)
		expect(res).toHaveProperty('status')
		expect(res.status).toStrictEqual('updated')
	})

	it('able to getBeneficiaries', async () => {
		const spyIris = jest.spyOn(iris, 'getBeneficiaries')
		const res = await iris.getBeneficiaries()
		expect(spyIris).toHaveBeenCalled()
		expect(spyIris).toHaveBeenCalledTimes(1)
		expect(res).toBeInstanceOf(Array)
		expect(res[0]).toHaveProperty('alias_name')
		expect(res[0]).toHaveProperty('account')
	})

	it('able to createPayouts', async () => {
		const spyIris = jest.spyOn(iris, 'createPayouts')
		const res = await iris.createPayouts({
			payouts: [
				{
					beneficiary_name: 'Budi Susantoo',
					beneficiary_account: '0611101146',
					beneficiary_bank: 'bca',
					beneficiary_email: 'budi.susantoo@example.com',
					amount: '10233',
					notes: 'unit test node js'
				}
			]
		})
		expect(spyIris).toHaveBeenCalled()
		expect(spyIris).toHaveBeenCalledTimes(1)
		expect(res).toHaveProperty('payouts')
		expect(res.payouts).toBeInstanceOf(Array)
		expect(res.payouts[0]).toHaveProperty('reference_no')
		expect(isType(res.payouts[0].reference_no)).toStrictEqual('string')
		globVar.createdRefNo = res.payouts[0].reference_no
	})

	it('fail to approvePayouts: role not authorized', async () => {
		const spyIris = jest.spyOn(iris, 'approvePayouts')
		const error = await getError<MidtransError>(() =>
			iris.approvePayouts({ reference_nos: [globVar.createdRefNo], otp: '335163' })
		)

		expect(spyIris).toHaveBeenCalled()
		expect(spyIris).toHaveBeenCalledTimes(1)
		expect(error.message).toMatch(/401/)
		expect(isType(error.message)).toStrictEqual('string')
	})

	// it('should be able to approvePayouts that has been created above', async () => {
	// 	const spyIris = jest.spyOn(iris, 'approvePayouts')
	// 	const res = await iris.approvePayouts({
	// 		reference_nos: [globVar.createdRefNo],
	// 		otp: '335163'
	// 	})
	// 	expect(spyIris).toHaveBeenCalled()
	// 	expect(spyIris).toHaveBeenCalledTimes(1)
	// 	expect(res).toHaveProperty('status')
	// 	expect(isType(res.status)).toStrictEqual('string')
	// })

	// currently it's not implemented because the testing API-key's role is not authorized,
	// should get it to work.

	// it('able to rejectPayouts that has been created above', async () => {
	// 	const spyIris = jest.spyOn(iris, 'rejectPayouts')
	// 	const res = await iris.rejectPayouts({
	// 		reference_nos: [globVar.createdRefNo],
	// 		reject_reason: 'Reason to reject payouts'
	// 	})

	// 	expect(spyIris).toHaveBeenCalled()
	// 	expect(spyIris).toHaveBeenCalledTimes(1)
	// 	expect(res).toHaveProperty('status')
	// 	expect(isType(res.status)).toStrictEqual('string')
	// })

	// it('able to getPayoutDetails that has been rejected above', async () => {
	// 	const spyIris = jest.spyOn(iris, 'getPayoutDetails')
	// 	const res = await iris.getPayoutDetails(globVar.createdRefNo)
	// 	expect(spyIris).toHaveBeenCalled()
	// 	expect(spyIris).toHaveBeenCalledTimes(1)
	// 	expect(res).toHaveProperty('status')
	// 	expect(isType(res.status)).toStrictEqual('string')
	// 	expect(res.status).toStrictEqual('rejected')
	// 	globVar.createdRefNo = res.reference_no
	// })

	it('able to getBalance', async () => {
		const spyIris = jest.spyOn(iris, 'getBalance')
		const res = await iris.getBalance()
		expect(spyIris).toHaveBeenCalled()
		expect(spyIris).toHaveBeenCalledTimes(1)
		expect(isType(res.balance)).toStrictEqual('string')
	})

	it('able to getTransactionHistory', async () => {
		const spyIris = jest.spyOn(iris, 'getTransactionHistory')
		const res = await iris.getTransactionHistory()
		expect(spyIris).toHaveBeenCalled()
		expect(spyIris).toHaveBeenCalledTimes(1)
		expect(res).toBeInstanceOf(Array)
		expect(isType(res[0].status)).toStrictEqual('string')
		expect(isType(res[0].reference_no)).toStrictEqual('string')
		expect(isType(res[0].beneficiary_account)).toStrictEqual('string')
	})

	it('able to getTopupChannels', async () => {
		const spyIris = jest.spyOn(iris, 'getTopupChannels')
		const res = await iris.getTopupChannels()
		expect(spyIris).toHaveBeenCalled()
		expect(spyIris).toHaveBeenCalledTimes(1)
		expect(res).toBeInstanceOf(Array)
		expect(isType(res[0].id)).toStrictEqual('number')
		expect(isType(res[0].virtual_account_type)).toStrictEqual('string')
		expect(isType(res[0].virtual_account_number)).toStrictEqual('string')
	})

	it('fail to getFacilitatorBalance not authorized due to non facilitator account', async () => {
		const spyIris = jest.spyOn(iris, 'getFacilitatorBalance')
		const error = await getError<MidtransError>(() => iris.getFacilitatorBalance())
		expect(spyIris).toHaveBeenCalled()
		expect(spyIris).toHaveBeenCalledTimes(1)
		expect(error.message).toMatch(/401/)
	})

	it('able to getFacilitatorBankAccounts not authorized due to non facilitator account', async () => {
		const spyIris = jest.spyOn(iris, 'getFacilitatorBankAccounts')
		const e = await getError<MidtransError>(() => iris.getFacilitatorBankAccounts())

		expect(spyIris).toHaveBeenCalled()
		expect(spyIris).toHaveBeenCalledTimes(1)
		expect(e.message).toMatch(/401/)
	})

	it('able to getBeneficiaryBanks', async () => {
		const spyIris = jest.spyOn(iris, 'getBeneficiaryBanks')
		const res = await iris.getBeneficiaryBanks()
		expect(spyIris).toHaveBeenCalled()
		expect(spyIris).toHaveBeenCalledTimes(1)
		expect(res.beneficiary_banks).toBeInstanceOf(Array)
		expect(isType(res.beneficiary_banks[0].code)).toStrictEqual('string')
		expect(isType(res.beneficiary_banks[0].name)).toStrictEqual('string')
	})

	it('able to validateBankAccount', async () => {
		const spyIris = jest.spyOn(iris, 'validateBankAccount')
		const res = await iris.validateBankAccount({ bank: 'mandiri', account: '1111222233333' })
		expect(spyIris).toHaveBeenCalled()
		expect(spyIris).toHaveBeenCalledTimes(1)
		expect(isType(res.account_no)).toStrictEqual('string')
		expect(isType(res.account_name)).toStrictEqual('string')
	})
})

/**
 * Helper functions
 */
function generateConfig() {
	return {
		isProduction: false,
		serverKey: config.irisApiKey
	}
}

function generateWithoutApiKey() {
	return {
		isProduction: false,
		serverKey: ''
	}
}
