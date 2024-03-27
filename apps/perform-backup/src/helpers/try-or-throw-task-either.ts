import { task as T, either as E, type taskEither as TE } from 'fp-ts';
import { pipe } from 'fp-ts/function';

export const tryOrThrowTaskEither =
  <E>(mapError: (error: E) => any) =>
  <A>(task: TE.TaskEither<E, A>): T.Task<A> =>
    pipe(
      task,
      T.map(result => {
        if (E.isLeft(result)) {
          throw mapError(result.left);
        }

        return result.right;
      }),
    );
