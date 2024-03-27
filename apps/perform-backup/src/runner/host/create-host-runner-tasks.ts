import { record as R } from 'fp-ts';
import { pipe } from 'fp-ts/function';

import type { BackupHostT } from 'policy';
import { createHostJobTask, type HostRunnerJobCtx } from './create-host-job-task';

export type HostRunnerTaskCtx = Omit<HostRunnerJobCtx, 'host'>;

export const createHostRunnerTasks = (ctx: HostRunnerTaskCtx) => (host: BackupHostT) =>
  pipe(
    host.jobs,
    R.mapWithIndex((name, job) =>
      pipe(
        {
          name,
          ...job,
        },
        createHostJobTask({
          ...ctx,
          host,
        }),
      ),
    ),
  );
