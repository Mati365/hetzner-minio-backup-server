import { join, dirname } from 'node:path';
import { execa } from 'execa';
import { pipe, flow } from 'fp-ts/function';
import { task as T } from 'fp-ts';

import { formatTimestamp, tapTask } from 'helpers';
import { keepOnlyNthMinioNewestFiles, uploadMinioFsFile } from 'runner/minio';

import type * as Minio from 'minio';
import type { Logger } from 'pino';
import type { BackupMinioConfigT, BackupRetentionT } from 'policy';

const compressDumpTask =
  ({ dir, logger }: CompressAndUploadCtx) =>
  (dbSqlPath: string) =>
    pipe(
      async () => {
        const dbArchiveFilePath = join(dir, 'dump.tar.gz');

        await execa('tar', ['-czvf', dbArchiveFilePath, dbSqlPath]);
        return dbArchiveFilePath;
      },
      tapTask(dbArchiveFilePath => {
        logger.info(`DB compressed to "${dbArchiveFilePath}"!`);
      }),
    );

const uploadDumpTask =
  ({ minio, logger }: CompressAndUploadCtx) =>
  (dbArchiveFilePath: string) => {
    const key = formatTimestamp(minio.key);

    return pipe(
      uploadMinioFsFile({
        filePath: dbArchiveFilePath,
        minio: {
          ...minio,
          key,
        },
      }),
      tapTask(minioKey => {
        logger.info(`DB uploaded to minio with key "${minioKey}!"`);
      }),
    );
  };

export const createCompressAndUploadTask = (ctx: CompressAndUploadCtx) =>
  flow(
    compressDumpTask(ctx),
    T.chain(uploadDumpTask(ctx)),
    T.chain(() =>
      keepOnlyNthMinioNewestFiles({
        client: ctx.minio.client,
        bucket: ctx.minio.bucket,
        keyPrefix: dirname(ctx.minio.key),
        keepNthFiles: ctx.retention.maxBackups,
      }),
    ),
  );

type CompressAndUploadCtx = {
  dir: string;
  logger: Logger<never>;
  retention: BackupRetentionT;
  minio: BackupMinioConfigT & {
    client: Minio.Client;
  };
};
