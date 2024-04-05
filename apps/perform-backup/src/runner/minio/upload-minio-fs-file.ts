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
    await minio.client.fPutObject(minio.bucket, minio.key, filePath);
    return minio.key;
  };
