import type * as Minio from 'minio';

export type GetAllMinioObjectsAttrs = {
  bucket: string;
  keyPrefix: string;
  client: Minio.Client;
};

export const getAllMinioBucketObjects =
  ({ client, keyPrefix, bucket }: GetAllMinioObjectsAttrs) =>
  async () =>
    await new Promise<Minio.BucketItem[]>((resolve, reject) => {
      const objectsListTemp: Minio.BucketItem[] = [];
      const stream = client.listObjectsV2(bucket, keyPrefix, true, '');

      stream.on('data', obj => {
        objectsListTemp.push(obj);
      });

      stream.on('error', reject);
      stream.on('end', () => {
        resolve(objectsListTemp);
      });
    });
