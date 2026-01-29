import { getAjussiProfiles } from '../src/app/api/ajussi/service'

// Manual Mock
const createMockBuilder = () => {
  const calls: any[] = []
  const builder = {
    select: (...args: any[]) => { calls.push({ method: 'select', args }); return builder },
    eq: (...args: any[]) => { calls.push({ method: 'eq', args }); return builder },
    contains: (...args: any[]) => { calls.push({ method: 'contains', args }); return builder },
    or: (...args: any[]) => { calls.push({ method: 'or', args }); return builder },
    order: (...args: any[]) => { calls.push({ method: 'order', args }); return builder },
    range: (...args: any[]) => { calls.push({ method: 'range', args }); return builder },
    then: (resolve: any) => resolve({ data: [], error: null, count: 10 }),
    // To allow awaiting
    [Symbol.toStringTag]: 'Promise'
  }
  return { builder, calls }
}

const mockSupabase = {
  from: (table: string) => {
    mockSupabase.lastTable = table
    return mockSupabase.builder
  },
  builder: null,
  calls: null,
  lastTable: null
} as any

async function runTests() {
  console.log('Running tests for getAjussiProfiles...')

  // Test 1: Basic query
  const { builder: builder1, calls: calls1 } = createMockBuilder()
  mockSupabase.builder = builder1
  mockSupabase.calls = calls1

  await getAjussiProfiles(mockSupabase, { page: 1, limit: 10 })

  if (mockSupabase.lastTable !== 'ajussi_profiles') throw new Error('Test 1 Failed: Wrong table')
  if (!calls1.find(c => c.method === 'select')) throw new Error('Test 1 Failed: Select missing')
  if (!calls1.find(c => c.method === 'eq' && c.args[0] === 'is_active')) throw new Error('Test 1 Failed: is_active missing')

  const rangeCall1 = calls1.find(c => c.method === 'range')
  if (rangeCall1.args[0] !== 0 || rangeCall1.args[1] !== 9) throw new Error(`Test 1 Failed: Pagination 0-9 expected, got ${rangeCall1.args}`)

  console.log('Test 1 passed')

  // Test 2: Search and Location
  const { builder: builder2, calls: calls2 } = createMockBuilder()
  mockSupabase.builder = builder2
  mockSupabase.calls = calls2

  await getAjussiProfiles(mockSupabase, {
    page: 2,
    limit: 5,
    search: 'test,term',
    location: 'Seoul'
  })

  const containsCall = calls2.find(c => c.method === 'contains')
  if (!containsCall || containsCall.args[0] !== 'available_areas' || containsCall.args[1][0] !== 'Seoul') {
    throw new Error('Test 2 Failed: Location filter missing or wrong')
  }

  const orCall = calls2.find(c => c.method === 'or')
  if (!orCall || !orCall.args[0].includes('title.ilike.%testterm%')) {
    throw new Error('Test 2 Failed: Search logic wrong')
  }

  const rangeCall2 = calls2.find(c => c.method === 'range')
  if (rangeCall2.args[0] !== 5 || rangeCall2.args[1] !== 9) {
    throw new Error(`Test 2 Failed: Pagination expected 5-9, got ${rangeCall2.args}`)
  }

  console.log('Test 2 passed')
  console.log('All tests passed!')
}

runTests().catch(e => {
  console.error(e)
  throw e
})
