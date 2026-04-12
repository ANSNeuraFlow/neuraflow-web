import { z } from 'zod';

export const eegDisplaySampleDto = z.object({
  timestamp: z.number(),
  ch1: z.number(),
  ch2: z.number(),
  ch3: z.number(),
  ch4: z.number(),
  ch5: z.number(),
  ch6: z.number(),
  ch7: z.number(),
  ch8: z.number(),
  marker: z.string().optional(),
});

export type EegDisplaySample = z.infer<typeof eegDisplaySampleDto>;

export function parseEegDisplayBatch(raw: unknown): EegDisplaySample[] {
  if (!Array.isArray(raw)) return [];
  const out: EegDisplaySample[] = [];
  for (const item of raw) {
    const parsed = eegDisplaySampleDto.safeParse(item);
    if (parsed.success) out.push(parsed.data);
  }
  return out;
}
