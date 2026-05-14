import { describe, it, expect, vi, beforeEach } from 'vitest'
import { api, getHouseholdById, createHousehold, checkMemberStatus } from '../../utils/api'

// Spy on the axios instance methods directly — bypasses HTTP but tests the right paths
beforeEach(() => {
    vi.restoreAllMocks()
    localStorage.clear()
})

describe('getHouseholdById', () => {
    it('makes a GET request to /households/:id', async () => {
        const spy = vi.spyOn(api, 'get').mockResolvedValue({ data: { id: '1', name: 'Flat 4B' } })
        await getHouseholdById('1')
        expect(spy).toHaveBeenCalledWith('/households/1')
    })

    it('returns the response data', async () => {
        vi.spyOn(api, 'get').mockResolvedValue({ data: { id: '1', name: 'Flat 4B' } })
        const result = await getHouseholdById('1')
        expect(result).toEqual({ id: '1', name: 'Flat 4B' })
    })
})

describe('createHousehold', () => {
    it('makes a POST request to /households', async () => {
        const spy = vi.spyOn(api, 'post').mockResolvedValue({ data: { id: '42' } })
        await createHousehold('42', ['Alice', 'Bob'])
        expect(spy).toHaveBeenCalledWith('/households', { id: '42', flatmateNames: ['Alice', 'Bob'] })
    })

    it('returns the response data', async () => {
        vi.spyOn(api, 'post').mockResolvedValue({ data: { id: '42' } })
        const result = await createHousehold('42', ['Alice', 'Bob'])
        expect(result).toEqual({ id: '42' })
    })
})

describe('checkMemberStatus', () => {
    it('makes a GET request to /households/member/status', async () => {
        const spy = vi.spyOn(api, 'get').mockResolvedValue({ data: { status: 'MEMBER' } })
        await checkMemberStatus()
        expect(spy).toHaveBeenCalledWith('/households/member/status')
    })

    it('returns the response data', async () => {
        vi.spyOn(api, 'get').mockResolvedValue({ data: { status: 'MEMBER' } })
        const result = await checkMemberStatus()
        expect(result).toEqual({ status: 'MEMBER' })
    })
})
