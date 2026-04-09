import { z } from 'zod';

const cpuSchema = z.object({
  usagePercent: z.number().nullable(),
});

const memorySchema = z.object({
  usedBytes: z.number().nullable(),
  totalBytes: z.number().nullable(),
  usedPercent: z.number().nullable(),
});

const diskSchema = z.object({
  usedBytes: z.number().nullable(),
  totalBytes: z.number().nullable(),
  usedPercent: z.number().nullable(),
});

export const clusterNodeDto = z.object({
  id: z.string(),
  address: z.string(),
  role: z.enum(['master', 'worker']),
  isOnline: z.boolean(),
  cpu: cpuSchema,
  memory: memorySchema,
  disk: diskSchema,
});

export const clusterSummaryDto = z.object({
  totalNodes: z.number(),
  onlineNodes: z.number(),
  offlineNodes: z.number(),
  cpu: cpuSchema,
  memory: memorySchema,
  disk: diskSchema,
});

export const clusterOverviewDto = z.object({
  nodes: z.array(clusterNodeDto),
  summary: clusterSummaryDto,
  fetchedAt: z.string(),
});
