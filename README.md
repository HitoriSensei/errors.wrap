# errors.wrap

This is a simple library for wrapping errors with additional context messages for rethrowing without losing the original error stack trace and message.

Inspired by GO Lang error wrapping.

## Example
    
### Without wrapping

#### Code
```js
function connectDatabase() {
    throw new Error('Database connection failed');
}

function startApp() {
    try {
        connectDatabase();
    } catch (err) {
        throw err;
    }
}


try {
    startApp();
} catch (err) {
    console.error(err);
}
```

#### Output

```
Error: Database connection failed
    at connectDatabase (test-nowrap.js:3:9)
    at startApp (test-nowrap.js:8:5)
    at Object.<anonymous> (test-nowrap.js:16:3)
    at Module._compile (node:internal/modules/cjs/loader:1112:14)
    at Module._extensions..js (node:internal/modules/cjs/loader:1166:10)
    at Module.load (node:internal/modules/cjs/loader:988:32)
    at Module._load (node:internal/modules/cjs/loader:834:12)
    at Function.executeUserEntryPoint [as runMain] (node:internal/modules/run_main:77:12)
    at node:internal/main/run_main_module:17:47

```

### With wrapping
```js
const { wrap } = require('@hitorisensei/errors.wrap');

function connectDatabase() {
  throw new Error('Database connection failed');
}

function startApp() {
  try {
    connectDatabase();
  } catch (err) {
    throw wrap(err, 'Cannot start app');
  }
}

try {
  startApp();
} catch (err) {
  console.error(err);
}
```

#### Output

```
Error: Cannot start app: Database connection failed
    at startApp (/Users/hitori/Projekty/wrap/test-wrap.js:11:11)
    at Object.<anonymous> (/Users/hitori/Projekty/wrap/test-wrap.js:16:3)
    at Module._compile (node:internal/modules/cjs/loader:1112:14)
    at Module._extensions..js (node:internal/modules/cjs/loader:1166:10)
    at Module.load (node:internal/modules/cjs/loader:988:32)
    at Module._load (node:internal/modules/cjs/loader:834:12)
    at Function.executeUserEntryPoint [as runMain] (node:internal/modules/run_main:77:12)
    at node:internal/main/run_main_module:17:47
Error: Database connection failed
    at connectDatabase (/Users/hitori/Projekty/wrap/test-wrap.js:4:9)
    at startApp (/Users/hitori/Projekty/wrap/test-wrap.js:9:5)
    at Object.<anonymous> (/Users/hitori/Projekty/wrap/test-wrap.js:16:3)
    at Module._compile (node:internal/modules/cjs/loader:1112:14)
    at Module._extensions..js (node:internal/modules/cjs/loader:1166:10)
    at Module.load (node:internal/modules/cjs/loader:988:32)
    at Module._load (node:internal/modules/cjs/loader:834:12)
    at Function.executeUserEntryPoint [as runMain] (node:internal/modules/run_main:77:12)
    at node:internal/main/run_main_module:17:47
```

## Issues

* Wrapped error stack trace is modified to include additional wrap hops, so it may break some tools that rely on stack trace format. 
