import { z } from 'zod';

export const droneVideoWatchCredentialsDto = z.object({
  streamKey: z.string().nullable(),
  token: z.string().nullable(),
  playbackAvailable: z.boolean(),
});

export type DroneVideoWatchCredentialsDto = z.infer<typeof droneVideoWatchCredentialsDto>;
