import { exhaustMap, defer, tap } from 'rxjs';
import { createLogger } from 'logger';

import type { CanBePromise } from 'types';

import { cron$ } from './cron$';

type CronRegisterAttrs = {
  expression: string;
  skipIfPreviousJobNotDone?: boolean;
};

export const registerCronAsyncTask =
  (attrs: CronRegisterAttrs) => {
    const logger = createLogger('cron');

    return (task: () => CanBePromise<void>) => {
      const execJob = async () => {
        try {
          await task();
        } catch (e) {
          logger.error(e, 'Failed to exec cron job!');
        }
      };

      logger.info(`Mounting cron job at "${attrs.expression}"!`);

      const middleware = attrs.skipIfPreviousJobNotDone
        ? exhaustMap(() => defer(execJob))
        : tap(() => {
            void execJob();
          });

      return cron$(attrs.expression).pipe(middleware).subscribe();
    };
  };
