import { TaggedException } from 'types';

export class UnknownConfigFileExtensionException extends TaggedException.ofLiteral(
  'UnknownConfigFileExtensionException',
) {}
