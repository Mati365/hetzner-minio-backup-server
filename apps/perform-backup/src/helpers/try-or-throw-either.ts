import * as E from 'fp-ts/Either';
import type { Either } from 'fp-ts/Either';

export const tryOrThrowEither =
  <E>(mapError: (error: E) => any) =>
  <A>(either: Either<E, A>): A => {
    if (E.isLeft(either)) {
      throw mapError(either.left);
    }

    return either.right;
  };
