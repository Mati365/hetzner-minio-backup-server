export const panicError = (message: string) => (meta?: any) =>
  new Error(
    [`PANIC! ${message}`, meta && JSON.stringify(meta, null, 2)].filter(Boolean).join('\n'),
  );
