export abstract class TaggedException<T extends string, E = any> extends Error {
  abstract readonly tag: T;

  constructor(public readonly details: E) {
    super();
    Error.captureStackTrace(this, TaggedException);
  }

  static ofLiteral = <const S extends string, E = any>(tag: S) =>
    class TaggedLiteralError extends TaggedException<S, E> {
      readonly tag = tag;
    };
}

export const isTaggedException = (error: any): error is TaggedException<any> =>
  error && 'tag' in error;
