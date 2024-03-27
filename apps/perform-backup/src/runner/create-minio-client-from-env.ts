import * as Minio from 'minio';

import type { EnvConfigT } from 'env';

export const createMinioClientFromEnv = (env: EnvConfigT) =>
  new Minio.Client({
    endPoint: env.S3_ENDPOINT,
    accessKey: env.S3_ACCESS_KEY,
    secretKey: env.S3_SECRET_KEY,
    port: env.S3_PORT,
    useSSL: false,
  });
