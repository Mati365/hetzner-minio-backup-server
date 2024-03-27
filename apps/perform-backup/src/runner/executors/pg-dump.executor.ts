import { join } from 'node:path';
import { execa } from 'execa';
import { pipe } from 'fp-ts/function';
import { task as T } from 'fp-ts';

import { createLogger } from 'logger';
import { tapTask } from 'helpers';
import { execInSshTunnel, type HostTunnelTaskAttrs } from 'runner/net';

import type { Executor } from './executor';
import { createCompressAndUploadTask } from './shared';

export const pgDump: Executor<'pg-dump'> = ({ tmpDir, host, job, minioClient }) => {
  const { database, minio, retention } = job;
  const logger = createLogger('pg-dump');

  const fetchDumpTask = (tunnel: HostTunnelTaskAttrs) =>
    pipe(
      async () => {
        const dbSqlPath = join(tmpDir, 'dump.sql');

        await execa(
          '/usr/bin/pg_dump',
          [
            `--port=${tunnel.local.port}`,
            `--host=${tunnel.local.host}`,
            `--username=${database.auth.username}`,
            `--dbname=${database.name}`,
            `--file=${dbSqlPath}`,
          ],
          {
            timeout: /* 90min */ 90 * 60 * 1000,
            shell: true,
            env: {
              PGPASSWORD: database.auth.password,
            },
          },
        );

        return dbSqlPath;
      },
      tapTask(dbSqlPath => {
        logger.info(`DB dumped to "${dbSqlPath}"!`);
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
