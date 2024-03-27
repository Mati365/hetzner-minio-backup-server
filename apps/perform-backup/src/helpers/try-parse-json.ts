import * as O from 'fp-ts/Option';

export const tryParseJSON = <T = any>(data: string) => O.tryCatch(() => JSON.parse(data) as T);
