import * as O from 'fp-ts/Option';
import yaml from 'yaml';

export const tryParseYML = <T = any>(data: string) => O.tryCatch(() => yaml.parse(data) as T);
