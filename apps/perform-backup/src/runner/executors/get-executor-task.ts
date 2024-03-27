import { panicError } from 'helpers';

import type { BackupHostJobKindT } from 'policy';
import type { Executor, ExecutorAttrs } from './executor';

import { pgDump } from './pg-dump.executor';
import { copy } from './copy.executor';
import { pgDumpAll } from './pg-dump-all.executor';

export type GenericExecutorAttrs = ExecutorAttrs<BackupHostJobKindT>;

const JOBS_EXECUTORS: ExecutorsMap = {
  'pg-dump-all': pgDumpAll,
  'pg-dump': pgDump,
  copy,
};

export const getExecutorTask = (attrs: GenericExecutorAttrs) => {
  const executor = JOBS_EXECUTORS[attrs.job.kind];

  if (!executor) {
    throw panicError('Unknown job executor!')(executor);
  }

  return executor(attrs as any);
};

type ExecutorsMap = {
  [K in BackupHostJobKindT]: Executor<K>;
};
