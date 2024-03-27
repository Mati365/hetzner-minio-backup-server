import { pipe, flow } from 'fp-ts/function';
import { task as T, array as A, date as D, ord as Ord, option as O } from 'fp-ts';

import type * as Minio from 'minio';

import {
  getAllMinioBucketObjects,
  type GetAllMinioObjectsAttrs,
} from './get-all-minio-bucket-objects';

type KeepNthNewestFilesAttrs = GetAllMinioObjectsAttrs & {
  keepNthFiles: number;
};

const sortByDate = pipe(
  D.Ord,
  Ord.contramap((item: Minio.BucketItem) => item.lastModified ?? new Date),
);

export const keepOnlyNthMinioNewestFiles = ({
  keepNthFiles,
  bucket,
  keyPrefix,
  client,
}: KeepNthNewestFilesAttrs) =>
  pipe(
    getAllMinioBucketObjects({
      bucket,
      keyPrefix,
      client,
    }),
    T.map(
      flow(
        A.sort(sortByDate),
        A.dropRight(keepNthFiles),
        A.filterMap(item => O.fromNullable(item.name)),
      ),
    ),
    T.chain(keys => async () => {
      await client.removeObjects(bucket, keys);
      return keys;
    }),
  );
