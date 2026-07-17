/** Logger used by the upgrade api to report progress. */
export interface Logger {
  log(...data: Array<unknown>): void;
  info(...data: Array<unknown>): void;
  warn(...data: Array<unknown>): void;
  error(...data: Array<unknown>): void;
}
