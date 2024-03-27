import { createReadStream } from 'node:fs';
import type * as Minio from 'minio';

type FileUploaderAttrs = {
  filePath: string;
  minio: {
    bucket: string;
    key: string;
    client: Minio.Client;
  };
};

export const uploadMinioFsFile =
  ({ minio, filePath }: FileUploaderAttrs) =>
  async () => {
    await minio.client.putObject(minio.bucket, minio.key, createReadStream(filePath));
    return minio.key;
  };
