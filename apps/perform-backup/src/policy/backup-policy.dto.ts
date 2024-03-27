import { z } from 'zod';

const DbLoginPasswordAuthV = z.object({
  host: z.string().default('127.0.0.1'),
  port: z.number().default(5432),
  username: z.string(),
  password: z.string(),
});

const BackupHostAuthV = z.intersection(
  z.object({
    username: z.string(),
    address: z.string(),
    port: z.number().optional().default(22),
  }),
  z.union([
    z.object({
      privateKey: z.string(),
    }),
    z.object({
      password: z.string(),
    }),
  ]),
);

const BackupRetentionV = z.object({
  maxBackups: z.number(),
});

const BackupCronV = z.object({
  expression: z.string(),
});

const BackupMinioConfigV = z.object({
  bucket: z.string(),
  key: z.string(),
});

const BackupBaseJobV = z.object({
  cron: BackupCronV,
  retention: BackupRetentionV,
  minio: BackupMinioConfigV,
});

export const BackupHostJobV = z.discriminatedUnion('kind', [
  BackupBaseJobV.extend({
    kind: z.literal('pg-dump'),
    database: z.object({
      name: z.string(),
      auth: DbLoginPasswordAuthV,
    }),
  }),
  BackupBaseJobV.extend({
    kind: z.literal('pg-dump-all'),
    database: z.object({
      auth: DbLoginPasswordAuthV,
    }),
  }),
  BackupBaseJobV.extend({
    kind: z.literal('copy'),
    fileOrDir: z.string(),
    exclude: z.array(z.string()).default([]),
  }),
]);

export const BackupHostV = z.object({
  auth: BackupHostAuthV,
  jobs: z.record(BackupHostJobV),
});

export const BackupPolicyV = z.object({
  hosts: z.array(BackupHostV).nonempty(),
});

export type BackupMinioConfigT = z.infer<typeof BackupMinioConfigV>;

export type BackupRetentionT = z.infer<typeof BackupRetentionV>;

export type BackupHostJobT = z.infer<typeof BackupHostJobV>;

export type BackupHostT = z.infer<typeof BackupHostV>;

export type BackupPolicyT = z.infer<typeof BackupPolicyV>;

export type BackupHostJobKindT = BackupHostJobT['kind'];

export type BackupHostJobByKindT<K extends BackupHostJobKindT> = Extract<
  BackupHostJobT,
  { kind: K }
>;
