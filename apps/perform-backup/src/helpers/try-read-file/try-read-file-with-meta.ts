import { extname } from 'node:path';
import { taskEither as TE } from 'fp-ts';
import { pipe } from 'fp-ts/function';
import { tryReadFile } from './try-read-file';

export const tryReadFileWithMeta = (filePath: string) =>
  pipe(
    tryReadFile(filePath),
    TE.map(content => ({
      content,
      extension: extname(filePath),
    })),
  );
