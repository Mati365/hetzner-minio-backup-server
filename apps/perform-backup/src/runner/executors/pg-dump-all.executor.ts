import { join } from 'node:path';
import { execa } from 'execa';
import { pipe } from 'fp-ts/function';
import { task as T } from 'fp-ts';

import { createLogger } from 'logger';
import { tapTask } from 'helpers';
import { execInSshTunnel, type HostTunnelTaskAttrs } from 'runner/net';

import type { Executor } from './executor';
import { createCompressAndUploadTask } from './shared';

export const pgDumpAll: Executor<'pg-dump-all'> = ({ tmpDir, host, job, minioClient }) => {
  const { database, minio, retention } = job;
  const logger = createLogger('pg-dump-all');

  const fetchDumpTask = (tunnel: HostTunnelTaskAttrs) =>
    pipe(
      async () => {
        const dbDumpPath = join(tmpDir, 'dump.sql');

        await execa(
          '/usr/bin/pg_dumpall',
          [
            `--port=${tunnel.local.port}`,
            `--host=${tunnel.local.host}`,
            `--username=${database.auth.username}`,
            `--file=${dbDumpPath}`,
            '--no-role-passwords',
          ],
          {
            timeout: /* 90min */ 90 * 60 * 1000,
            shell: true,
            env: {
              PGPASSWORD: database.auth.password,
            },
          },
        );

        return dbDumpPath;
      },
      tapTask(dbDumpPath => {
        logger.info(`Dumped all dbs to to "${dbDumpPath}"!`);
      }),
    );

  return pipe(
    fetchDumpTask,
    execInSshTunnel({
      host,
      dest: {
        port: database.auth.port,
      },
    }),
    T.chain(
      createCompressAndUploadTask({
        dir: tmpDir,
        logger,
        retention,
        minio: {
          ...minio,
          client: minioClient,
        },
      }),
    ),
  );
};
