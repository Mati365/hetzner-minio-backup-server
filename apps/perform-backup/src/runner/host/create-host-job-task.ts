import { mkdtemp, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { pipe } from 'fp-ts/function';
import { task as T } from 'fp-ts';

import { createLogger } from 'logger';
import { registerCronAsyncTask, tapTask } from 'helpers';
import { getExecutorTask, type GenericExecutorAttrs } from 'runner/executors';

import type * as Minio from 'minio';
import type { BackupHostJobT, BackupHostT } from 'policy';

export type HostRunnerJobCtx = {
  minioClient: Minio.Client;
  host: BackupHostT;
  runInCron?: boolean;
  runOnStart?: boolean;
};

type NamedBackupHostJobT = BackupHostJobT & {
  name: string;
};

export const createHostJobTask =
  ({ host, runInCron, minioClient, runOnStart }: HostRunnerJobCtx) =>
  (job: NamedBackupHostJobT) => {
    const { name, cron } = job;
    const logger = createLogger('task-runner');

    const executor = async () => {
      const tmpDir = await mkdtemp(join(tmpdir(), 'runner-host-job-task-'));
      const executorAttrs: GenericExecutorAttrs = {
        host,
        job,
        minioClient,
        tmpDir,
      };

      logger.info(
        {
          ...executorAttrs,
          minioClient: '<s3-client>',
        },
        `Starting ${name} job in host ${host.auth.address}!`,
      );

      try {
        await getExecutorTask(executorAttrs)();
      } catch (error) {
        logger.error(error, `Error during ${name} job execution on ${host.auth.address}!`);
      } finally {
        logger.info(`Removing tmp dir: "${tmpDir}"!`);

        await rm(tmpDir, {
          recursive: true,
          force: true,
        });
      }

      logger.info(`Stopping ${name} job in host ${host.auth.address}!`);
    };

    return pipe(
      runOnStart ? executor : T.of(undefined),
      tapTask(() => {
        if (runInCron) {
          const cronRunner = registerCronAsyncTask({ ...cron, skipIfPreviousJobNotDone: true });

          cronRunner(executor);
        }
      })
    );
  };
