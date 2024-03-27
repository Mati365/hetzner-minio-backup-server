import pino from 'pino';
import pretty from 'pino-pretty';

export const createLogger = (scope?: string) =>
  pino(
    {
      ...(scope && {
        msgPrefix: `[${scope}] `,
      }),
    },
    pretty({
      colorize: true,
    }),
  );
