import { Command } from '@commander-js/extra-typings';
import { task as T } from 'fp-ts';
import { pipe } from 'fp-ts/function';

import { tryReadBackupPolicyOrPanic } from 'policy';
import { tryReadEnvOrPanic } from 'env';
import { tapTask } from 'helpers';
import { createRunnerTask } from 'runner';
import { createLogger } from 'logger';

const logger = createLogger('server');
const program = new Command()
  .option('-j, --jobs <string>')
  .option('-r, --run-on-start')
  .option('-c, --cron')
  .parse();

const opts = program.opts();

await pipe(
  T.Do,
  T.bind('env', () => T.of(tryReadEnvOrPanic())),
  T.bind('policy', ({ env }) => tryReadBackupPolicyOrPanic(env.BACKUP_POLICY_PATH)),
  tapTask(ctx => {
    logger.info(opts, 'Run args');
    logger.info(ctx, 'Context');
    logger.info('Starting up backup server... 🚀');
  }),
  T.chain(ctx =>
    createRunnerTask(ctx)({
      runOnlyJobs: opts.jobs?.split(','),
      runOnStart: opts.runOnStart,
      runInCron: opts.cron,
    }),
  ),
)();
