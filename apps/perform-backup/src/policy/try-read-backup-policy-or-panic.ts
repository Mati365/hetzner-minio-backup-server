import { flow } from 'fp-ts/function';

import {
  panicError,
  tryOrThrowTaskEither,
  tryParseUsingZodSchemaTE,
  tryReadConfigFile,
} from 'helpers';

import { BackupPolicyV } from './backup-policy.dto';

export const tryReadBackupPolicyOrPanic = flow(
  tryReadConfigFile,
  tryParseUsingZodSchemaTE(BackupPolicyV),
  tryOrThrowTaskEither(panicError('Cannot read backup config!')),
);
