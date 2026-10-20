import { expect } from '@playwright/test';
import type { z } from 'zod';

/** Contract check: fails with the Zod issue list so the report shows exactly which field broke. */
export function expectSchema(schema: z.ZodType, data: unknown, label = 'response'): void {
  const result = schema.safeParse(data);
  expect(result.success, `${label} violates its schema: ${result.success ? '' : result.error.message}`).toBe(true);
}
