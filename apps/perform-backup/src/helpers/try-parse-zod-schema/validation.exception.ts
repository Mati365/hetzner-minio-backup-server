import * as E from 'fp-ts/Either';
import { TaggedException } from 'types';

import type { IO } from 'fp-ts/IO';

export class ValidationException extends TaggedException.ofLiteral('ValidationException') {
  static tryIO = <T>(task: IO<T>) => E.tryCatch(task, (err: any) => new ValidationException(err));
}
