import { pipe } from 'fp-ts/function';
import * as T from 'fp-ts/Task';

export const tapTask =
  <A>(fn: (data: A) => void) =>
  (task: T.Task<A>): T.Task<A> =>
    pipe(
      task,
      T.map(data => {
        fn(data);
        return data;
      }),
    );

export const tapTaskT =
  <A, R>(fn: (data: A) => T.Task<R>) =>
  (task: T.Task<A>): T.Task<A> =>
    pipe(task, T.chainFirst(fn));
