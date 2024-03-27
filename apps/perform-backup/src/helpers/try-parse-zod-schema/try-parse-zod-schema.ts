import { pipe } from 'fp-ts/function';
import { taskEither as TE, type either as E } from 'fp-ts';

import type { ZodFirstPartySchemaTypes, z } from 'zod';
import { ValidationException } from './validation.exception';

export const tryParseUsingZodSchema =
  <S extends ZodFirstPartySchemaTypes>(schema: S) =>
  (value: unknown): E.Either<ValidationException, z.infer<S>> =>
    ValidationException.tryIO(() => schema.parse(value) as z.infer<S>);

export const tryParseUsingZodSchemaTE =
  <S extends ZodFirstPartySchemaTypes>(schema: S) =>
  <E>(task: TE.TaskEither<any, E>): TE.TaskEither<ValidationException, z.infer<S>> =>
    pipe(task, TE.chainEitherKW(tryParseUsingZodSchema(schema)));
