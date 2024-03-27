import { readFile } from 'node:fs/promises';
import { either as E } from 'fp-ts';
import { FsException } from './fs.exception';

export const tryReadFile = (filePath: string) => async () => {
  try {
    return E.right(await readFile(filePath, 'utf-8'));
  } catch (e) {
    return E.left(new FsException(e));
  }
};
