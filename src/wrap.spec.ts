import { unwrap, wrap } from './wrap';

describe('wrap', () => {
  it('should generate exhaustive stack trace', () => {
    const error = new Error('original error');
    expect(error.stack).not.toBeFalsy();

    const forwardedError = wrap(
      wrap(error, 'some process failed'),
      'other wrapper',
    );
    expect(forwardedError.message).toContain('some process failed');

    // Should contain the original error message
    expect(forwardedError.message).toContain('original error');

    // Should contain the error message chain
    expect(forwardedError.stack).toContain(
      'Error: other wrapper: some process failed: original error',
    );

    // Should contain the original error stack
    expect(forwardedError.stack).toContain(error.stack);

    // Should contain more that original error stack
    expect(forwardedError.stack).not.toBe(error.stack);
  });

  it('should work with try/catch', function () {
    expect(function () {
      try {
        throw new Error('original error');
      } catch (error) {
        throw wrap(error, 'test');
      }
    }).toThrowError('test: original error');
  });

  it('should work with instance checks', function () {
    class SomeCustomError extends Error {
      extraField = 123;

      constructor(message: string) {
        super(message);
      }
    }

    try {
      throw 'someone has thrown a string';
    } catch (error) {
      const nonErrorSource = wrap(
        wrap(error, 'some forwarding'),
        'more forwarding',
      );
      expect(nonErrorSource).toBeInstanceOf(Error);
    }

    const doubleReThrown = wrap(
      wrap(new SomeCustomError('original error'), 'some forwarding'),
      'more forwarding',
    );

    expect(doubleReThrown).toBeInstanceOf(SomeCustomError);

    expect(doubleReThrown.extraField).toBe(123);

    expect(function () {
      try {
        try {
          throw new SomeCustomError('original error');
        } catch (error) {
          throw wrap(error, 'test');
        }
      } catch (error) {
        throw wrap(error, 'more forwarding');
      }
    }).toThrowError(SomeCustomError);
  });
});

describe('unwrap', () => {
  it('should unwrap error', () => {
    const error = new Error('original error');
    const forwardedError = wrap(error, 'some process failed');
    const unwrappedError = unwrap(forwardedError);
    expect(unwrappedError).toBe(error);
  });

  it('should unwrap error recursively', () => {
    const error = new Error('original error');
    const forwardedError = wrap(error, 'some process failed');
    const forwardedError2 = wrap(forwardedError, 'some process failed');
    const unwrappedError = unwrap(forwardedError2);
    expect(unwrappedError).toBe(error);
  });

  it('should unwrap error recursively with non-error', () => {
    const forwardedError = wrap('non-error', 'some process failed');
    const forwardedError2 = wrap(forwardedError, 'some process failed');
    const unwrappedError = unwrap(forwardedError2);
    expect(unwrappedError).toBe('non-error');
  });
});
