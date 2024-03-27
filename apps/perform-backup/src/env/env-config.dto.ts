import { z } from 'zod';

export const EnvConfigV = z.object({
  BACKUP_POLICY_PATH: z.string(),
  S3_ENDPOINT: z.string().default('127.0.0.1'),
  S3_PORT: z.coerce.number().default(9000),
  S3_ACCESS_KEY: z.string(),
  S3_SECRET_KEY: z.string(),
});

export type EnvConfigT = z.infer<typeof EnvConfigV>;
