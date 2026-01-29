import { deleteUserData } from '../src/lib/account-deletion';
import { performance } from 'perf_hooks';

// Mock Supabase Client
const DELAY_MS = 50;

const mockSupabase = {
  from: (table: string) => {
    return {
      delete: () => {
        return {
          eq: async (col: string, val: string) => {
            // Simulate network delay
            await new Promise(resolve => setTimeout(resolve, DELAY_MS));
            // console.log(`Deleted from ${table} where ${col} = ${val}`);
            return { error: null };
          }
        };
      }
    };
  }
} as any;

async function runBenchmark() {
  console.log(`Starting benchmark with ${DELAY_MS}ms delay per operation...`);
  const start = performance.now();
  await deleteUserData(mockSupabase, 'test-user-id');
  const end = performance.now();
  console.log(`Execution time: ${(end - start).toFixed(2)}ms`);
}

runBenchmark();
