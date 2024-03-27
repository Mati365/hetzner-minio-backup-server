import { join } from 'node:path';
import { execa } from 'execa';
import { pipe } from 'fp-ts/function';
import { task as T } from 'fp-ts';

import { createLogger } from 'logger';
import { tapTask } from 'helpers';

import type { Executor } from './executor';

import { createCompressAndUploadTask } from './shared';

export const copy: Executor<'copy'> = ({ tmpDir, host, job, minioClient }) => {
  const { minio, retention, fileOrDir, exclude } = job;
  const { auth } = host;

  const logger = createLogger('copy');
  const rsyncFiles = pipe(
    async () => {
      const dumpDir = join(tmpDir, 'dump');

      const authSshPasswordPrefix = 'password' in auth ? `sshpass -p ${auth.password} ` : '';
      const authSshKeySuffix = 'privateKey' in auth ? `-i ${auth.privateKey}` : '';

      await execa(
        '/usr/bin/rsync',
        [
          '-azm',
          '-e',
          `"${authSshPasswordPrefix}ssh ${authSshKeySuffix} -o StrictHostKeyChecking=no -l ${auth.username}"`,
          '--safe-links',
          ...exclude.map(excludePattern => `--exclude=${excludePattern}`),
          `${auth.username}@${auth.address}:${fileOrDir}`,
          dumpDir,
        ],
        {
          shell: true,
        },
      );

      return dumpDir;
    },
    tapTask(dumpDir => {
      logger.info(`Files dumped to "${dumpDir}"!`);
    }),
  );

  return pipe(
    rsyncFiles,
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
