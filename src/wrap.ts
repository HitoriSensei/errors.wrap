function removeFirstLine(stack: string): string {
  const firstLineEnd = stack.indexOf('\n');
  return stack.slice(firstLineEnd + 1);
}

/**
 * Created to be used inside catch blocks to normalize and re-throw the error with the
 * original stack trace and additional context message prepended with colon.
 * Similarly to how it is commonly done in GOLang.
 *
 * @example
 * ```typescript
 * try {
 *   // ...something throws new Error('Database crashed')...
 * } catch (error) {
 *   // re-throw with original stack trace.
 *   // message will be prepended with 'The process failed: '
 *   // resulting in 'The process failed: Database crashed'
 *   throw wrap('The process failed', error);
 * }
 * ```
 */
export function wrap<T extends Error>(
  sourceError: T,
  message: string,
  // eslint-disable-next-line @typescript-eslint/ban-types
  stackSource?: Function,
): Error & T;
export function wrap(
  sourceError: unknown,
  message: string,
  // eslint-disable-next-line @typescript-eslint/ban-types
  stackSource?: Function,
): Error;
export function wrap<T>(
  sourceError: T,
  message: string,
  // eslint-disable-next-line @typescript-eslint/ban-types
  stackSource: Function = wrap,
): Error & T {
  if (sourceError && sourceError instanceof Error) {
    function ForwardedErrorWithErrorSource(this: any) {
      const errorSourceError = sourceError as any as Error;
      Error.captureStackTrace(this, stackSource);
      const stack = this.stack;

      const newMessage = `${message}: ${errorSourceError.message}`;
      this.message = newMessage;

      this.stack = `${this.name}: ${newMessage}\n${removeFirstLine(stack)}\n${
        errorSourceError.stack
      }`;

      Object.defineProperty(this, 'originalError', {
        enumerable: false,
        value: unwrap(errorSourceError),
      });
    }

    ForwardedErrorWithErrorSource.prototype = sourceError;

    return new (ForwardedErrorWithErrorSource as any)();
  } else {
    function ForwardedErrorWithNonErrorSource(this: any) {
      this.name = message;

      this.message = `${message}: ${String(sourceError)}`;

      this.originalError = sourceError;

      Object.defineProperty(this, 'originalError', {
        enumerable: false,
        value: sourceError,
      });

      Error.captureStackTrace(this, stackSource);
    }

    ForwardedErrorWithNonErrorSource.prototype = Error.prototype;

    return new (ForwardedErrorWithNonErrorSource as any)();
  }
}

/**
 * Returns the original error if it was wrapped with `wrap()`, otherwise
 * returns the error itself.
 * @param error
 */
export function unwrap(error: unknown): unknown {
  return (
    (error &&
      typeof error === 'object' &&
      'originalError' in error &&
      error.originalError) ||
    error
  );
}
