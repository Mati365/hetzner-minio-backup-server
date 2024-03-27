import { pipe } from 'fp-ts/function';
import * as dotenv from 'dotenv';

import { panicError, tryOrThrowEither, tryParseUsingZodSchema } from 'helpers';
import { EnvConfigV } from './env-config.dto';

export const tryReadEnvOrPanic = () => {
  dotenv.config();

  return pipe(
    process.env,
    tryParseUsingZodSchema(EnvConfigV),
    tryOrThrowEither(panicError('Incorrect env config!')),
  );
};
