import { taskEither as TE, option as O } from 'fp-ts';
import { flow } from 'fp-ts/function';

import { tryReadFileWithMeta } from '../try-read-file';
import { tryParseYML } from '../try-parse-yml';
import { tryParseJSON } from '../try-parse-json';

import { UnknownConfigFileExtensionException } from './fs-config-file.exception';

export const tryReadConfigFile = flow(
  tryReadFileWithMeta,
  TE.chainOptionKW(() => TE.left(new UnknownConfigFileExtensionException(undefined)))(
    ({ content, extension }) => {
      switch (extension) {
        case '.yml':
        case '.yaml':
          return tryParseYML(content);

        case '.json':
          return tryParseJSON(content);
      }

      return O.none;
    },
  ),
);
