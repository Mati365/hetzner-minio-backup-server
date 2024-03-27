import type * as Minio from 'minio';

import type { ReaderTask } from 'fp-ts/ReaderTask';
import type { BackupHostJobByKindT, BackupHostJobKindT, BackupHostT } from 'policy';

export type ExecutorAttrs<K extends BackupHostJobKindT> = {
  host: BackupHostT;
  job: BackupHostJobByKindT<K>;
  tmpDir: string;
  minioClient: Minio.Client;
};

export type Executor<K extends BackupHostJobKindT> = ReaderTask<ExecutorAttrs<K>, unknown>;
