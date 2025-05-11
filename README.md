# Extended-Console

**Extended-Console** is a versatile, drop-in replacement for the native `console` object in Node.js environments (and adaptable for browsers). It supercharges your logging with customizable emoji/icon prefixes, support for external icon packs, development-only logging, per-call prefix overrides, and the ability to define your own custom logging methods.

Once initialized, it seamlessly augments the global `console` object, meaning all existing `console.log` calls (and its brethren) in your codebase, as well as in your dependencies, can benefit from its features if you override their default behavior.

---

## 🚀 Features

- ✅ **Enhanced Clarity:** Customizable emoji or icon-based prefixes for `log`, `warn`, `error`, `success`, etc.
- 🎨 **Custom Methods:** Easily define your own logging methods (e.g., `console.audit()`, `console.dbQuery()`) with custom prefixes.
- 🧩 **Icon Packs:** Support for external emoji icon packs like [emoji-icons](https://github.com/UltimaServe-com/emoji-icons.git).
- 🧪 **Dev-Only Logging:** use `console.dev()` method for logs that only should appear in developer mode.
- 🚫 **Prefix Control:** Temporarily disable prefixes for specific calls with console.noPrefix().log(...).
- 🔌 **Highly Configurable:** Fine-tune every aspect, from global prefix usage to individual method prefixes.
- 🌍 **Global Override:** Modifies the global console object after init(), enhancing logging application-wide.

---

## 📦 Installation

```bash
npm install https://github.com/UltimaServe-com/Extended-Console.git
```

If you plan to use the optional emoji icon pack (optional):

```bash
npm install https://github.com/UltimaServe-com/emoji-icons.git
```

---

## 🛠️ Quick Setup

This is the simplest way to get started. Just import and initialize at very beginning of your app:

```js
import ExtendedConsole from '@ultimaserve/extended-console';

const consoleEx = new ExtendedConsole();

await consoleEx.init();
```

> **TIP:** You can create some initializer in your app to set up the console with your preferred configuration. This is especially useful for larger projects.

---

## ⚙️ Configuration Options

| Option               | Type      | Default                                      | Description |
|----------------------|-----------|----------------------------------------------|-------------|
| `usePrefix`          | `boolean` | `true`                                       | Enable or disable prefix globally |
| `useDefaultPrefixes` | `boolean` | `true`                                       | Use built-in emoji defaults when no icon pack or override is provided |
| `defaultPrefix`      | `string`  | `""`                                         | Fallback prefix string if none is found |
| `prefix`             | `object`  | `{}`                                         | Override specific method prefixes (e.g. `{ log: '🛠️' }`) |
| `useIconPack`        | `boolean` | `false`                                      | Enable support for [emoji-icons](https://github.com/UltimaServe-com/emoji-icons.git) |
| `devMode`            | `boolean` | `process.env.NODE_ENV === 'development'`     | Controls if `console.dev()` is active |
| `customMethods`      | `object`  | `{}`                                         | Define custom logging methods. Keys are method names, values are functions. E.g., `{ db: (query) => query }`. |

> **Note:** All configuration parameters are optional and have sensible defaults.

---

## 🧱 Default Prefixes

If `useDefaultPrefixes` is `true`, these are the defaults per method:

| Method   | Default Prefix (Visual) |
|----------|--------------------------|
| `log`    | `>`                      |
| `success`| ✔ (green)                |
| `warn`   | ⚠ (yellow)               |
| `error`  | ✖ (red)                  |
| `info`   | ℹ (blue)                 |
| `check`  | ✔ (blue)                 |
| `skip`   | >> (cyan)                |
| `connect`   | (no default, uses `defaultPrefix`)  |
| `disconnect` | (no default, uses `defaultPrefix`)  |


> `useDefaultPrefixes` is `true` by default

This prefixes can be overridden using the `prefix` option

```js
import ExtendedConsole from '@ultimaserve/extended-console';

const consoleEx = new ExtendedConsole({
    prefix: {
        log: '[LOG]',
    }
});

await consoleEx.init();

console.log('This is a log message');
// Output: [LOG] This is a log message
```

---

## 🎨 Icon Pack Mapping ([emoji-icons](https://github.com/UltimaServe-com/emoji-icons.git))

If `useIconPack: true` and the icon pack is installed, `Extended-Console` attempts to use these mappings.  
These can be individually overridden via the `prefix` option.

| Method      | Icon Name (from icon pack) |
|-------------|-----------------------------|
| `log`       | `pin`                       |
| `success`   | `check_green`               |
| `warn`      | `warning`                   |
| `error`     | `cross`                     |
| `info`      | `diamond_blue_small`        |
| `check`     | `success`                   |
| `skip`      | `next`                      |
| `connect`   | `connect`                   |
| `disconnect`| `disconnect`                |


---

## 📒 General Usage Examples

### Regular logging (default)

```js
console.log('Application is starting...');
// Output: > Application is starting...

console.success('User data successfully saved!');
// Output: ✔ User data successfully saved!

console.warn('Low disk space warning.');
// Output: ⚠ Low disk space warning.

console.error('Failed to connect to the database!');
// Output: ✖ Failed to connect to the database!
```

### Disable prefix per call

you can disable the prefix for a specific call using `noPrefix()`:

```js
console.noPrefix().warn('This is a plain warning, no icon/prefix here.');
// Output: This is a plain warning, no icon/prefix here.

console.noPrefix().log('Just a simple message.');
// Output: Just a simple message.
```

### Development-Only Logging

```js
console.dev().info('Current user session:', { userId: 123, role: 'admin' });
// Output (in devMode): ℹ Current user session: { userId: 123, role: 'admin' }
// Output (not in devMode): (nothing)

console.dev().log('Debugging variable:', someVariable);
// Output (in devMode): > Debugging variable: ...
// Output (not in devMode): (nothing)
```

> `console.dev()` returns a silent proxy when not in dev mode.

---

## 💡 Pro Tip

You can combine multiple setups.

- **Environment-Specific Prefixes:** Globally disable prefixes in production for cleaner logs, while keeping them in development for clarity:

```js
const consoleEx = new ExtendedConsole({
  usePrefix: process.env.NODE_ENV !== 'production',
  // ... other settings
});
await consoleEx.init();

```

- **Browser Usage:** When using in a browser and relying on `devMode` tied to `process.env.NODE_ENV`, ensure your build tool (Webpack, Parcel, etc.) correctly shims or replaces `process.env.NODE_ENV`. Alternatively, explicitly set `devMode: true` or `devMode: false` in your configuration.

---

## 🛠️ Custom Methods

One of the most powerful features is the ability to add your own semantic logging methods.  

Add your methods to the `customMethods` object in the configuration.  
The function you provide will receive the arguments passed to your custom console method. What it returns will be logged.  
You can also assign a custom prefix to your new method via the `prefix` configuration option.

```js
import ExtendedConsole from '@ultimaserve/extended-console';

const consoleEx = new ExtendedConsole({
prefix: {
    // Define prefixes for your custom methods
    audit: '🛡️',
    dbQuery: '💾',
    userInput: '👤'
},
customMethods: {
    // Method name: function handler
    audit: (user, action, details = {}) => {
    // Your function can process/format the arguments
    return `User '${user}' performed '${action}'. Details: ${JSON.stringify(details)}`;
    },
    dbQuery: (query, params) => {
    return [`Executing query: ${query}`, params || {}]; // Return array for multiple log parts
    },
    userInput: (field, value) => {
    // Simple pass-through for this example
    return `Input for ${field}: ${value}`;
    }
},
devMode: true // Forcing dev mode for example
});

await consoleEx.init();

// Use your custom methods
console.audit('Alice', 'Logged In', { ip: '192.168.1.100' });
// Output: 🛡️ User 'Alice' performed 'Logged In'. Details: {"ip":"192.168.1.100"}

console.dbQuery('SELECT * FROM users WHERE id = ?', [1]);
// Output: 💾 Executing query: SELECT * FROM users WHERE id = ? { '0': 1 } (or similar, depending on array stringification)

// Custom methods work with noPrefix() and dev() too!
console.noPrefix().userInput('Username', 'bob_the_builder');
// Output: Input for Username: bob_the_builder

console.dev().audit('DevUser', 'Test Action');
// Output: 🛡️ User 'DevUser' performed 'Test Action' (because devMode is true)

```

**How it Works:**

- Your custom function (e.g., the one for audit) is called.
- `Extended-Console` takes what your function returns.
- It prepends the configured prefix (e.g., 🛡️ for audit).
- It then logs the result using the original console.log (by default).

This allows you to create a more expressive and semantic logging layer for your application.

---

## 🧩 Extending Extended-Console (Advanced)

While `Extended-Console` is designed to be configured directly, you might want to create your own specialized logger module on top of it, perhaps for a large project or a library.  

**Why Extend?**
- To create a pre-configured logger for your team/project with specific custom methods and prefixes.
- To add more complex logic or state to your logger instance.
- To provide a simpler API for your users if `Extended-Console`'s full config is too much.


**Example: Creating** `MyProjectLogger`:

```js
// MyProjectLogger.js
import ExtendedConsole from '@ultimaserve/extended-console'; // or your published package name

class MyProjectLogger extends ExtendedConsole {
    constructor(configOverrides = {}) {
        const defaultConfig = {
            useIconPack: false, // Maybe your project doesn't use it
            defaultPrefix: 'APP:',
            prefix: {
            log: '📝',
            success: '✅',
            error: '🔥',
            network: '🌐', // For a custom method
            security: '🔒' // For another custom method
            },
            customMethods: {
            network: (url, status) => `Request to ${url} - Status: ${status}`,
            security: (level, message) => `[${level.toUpperCase()}] ${message}`
            },
            devMode: process.env.NODE_ENV === 'development',
            ...configOverrides, // Allow users to override project defaults
        };
        super(defaultConfig);
    }

    // init is already inherited and should be called on the instance
    async init() {
        await super.init();
        // Any additional setup for your project logger
    }
}

export default MyProjectLogger;

```

**How to use MyProjectLogger:**

```js
import MyProjectLogger from './MyProjectLogger.js';

async function main() {
    const myLoggerInstance = new MyProjectLogger({ devMode: true });
    await myLoggerInstance.init(); // Don't forget to init!

    console.log('Standard log with project prefix.');
    console.success('Something great happened!');
    console.network('/api/users', 200);
    console.security('info', 'User session initiated.');
    console.dev().security('debug', 'Checking permissions...');
}

main();
```

In this example, `MyProjectLogger` provides a ready-to-use console setup tailored for "MyProject".  
Users of `MyProjectLogger` get these specialized methods and prefixes out of the box but can still override them if needed.  
Remember, after instantiating your derived logger, you still need to call `await instance.init()` to apply its settings to the global `console` object.

