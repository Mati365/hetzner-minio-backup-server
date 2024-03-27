import { array as A, task as T } from 'fp-ts';
import { pipe, flow, identity } from 'fp-ts/function';
import { pick } from 'fp-ts-std/Struct';

import type { EnvConfigT } from 'env';
import type { BackupPolicyT } from 'policy';

import { createMinioClientFromEnv } from './create-minio-client-from-env';
import { createHostRunnerTasks, type HostRunnerTaskCtx } from './host/create-host-runner-tasks';

type RunnerCtx = {
  env: EnvConfigT;
  policy: BackupPolicyT;
};

type RunnerRunArgs = Pick<HostRunnerTaskCtx, 'runOnStart' | 'runInCron'> & {
  runOnlyJobs?: string[];
};

export const createRunnerTask =
  ({ env, policy }: RunnerCtx) =>
  ({ runOnlyJobs, runOnStart, runInCron }: RunnerRunArgs = {}) => {
    const minioClient = createMinioClientFromEnv(env);

    return pipe(
      policy.hosts,
      A.map(
        flow(
          createHostRunnerTasks({
            runOnStart,
            runInCron,
            minioClient,
          }),
          runOnlyJobs ? pick(runOnlyJobs) : identity,
        ),
      ),
      A.flatMap(Object.values),
      T.sequenceSeqArray,
    );
  };
