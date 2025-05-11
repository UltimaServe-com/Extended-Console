const ICON_PACK_MAP = {
  log: 'pin',
  success: 'check_green',
  warn: 'warn',
  error: 'fail',
  info: 'info',
  check: 'success',
  skip: 'skip',
  connect: 'connect',
  disconnect: 'disconnect',
};

const DEFAULT_PREFIXES = {
  log: '>',
  success: '\x1b[32m✔\x1b[0m', // Green check mark
  warn: '\x1b[33m⚠\x1b[0m',   // Yellow warning
  error: '\x1b[31m✖\x1b[0m',   // Red cross
  info: '\x1b[34mℹ\x1b[0m',    // Blue info
  check: '\x1b[34m✔\x1b[0m',   // Blue check mark
  skip: '\x1b[36m>>\x1b[0m',   // Cyan arrows
};

/**
 * ExtendedConsole
 *
 * A customizable drop-in replacement for the global `console` object, providing enhanced logging capabilities:
 * - Emoji or icon-based method prefixes (e.g., ✅ success, ⚠️ warn)
 * - Option to load external emoji icon packs (@ultimaserve/emoji-icons)
 * - Dev-only logging with `console.dev()` method (only works in development mode)
 * - Temporarily disable prefixes for individual calls with `console.noPrefix()`
 * - Ability to add custom logging methods.
 *
 * Configuration Options:
 * @param {Object} config
 * @param {boolean} [config.usePrefix=true]                     - Enable or disable all prefixes globally.
 * @param {boolean} [config.useDefaultPrefixes=true]            - Enable or disable built-in emoji defaults (fallback if icon pack not used).
 * @param {string}  [config.defaultPrefix=""]                   - A fallback prefix string for methods that don't have a defined prefix.
 * @param {Object}  [config.prefix={}]                          - Override prefixes per method (e.g., { success: '💡', customLog: '🚀' }).
 * @param {boolean} [config.useIconPack=false]                  - Whether to try loading an external emoji icon pack (`@ultimaserve/emoji-icons`).
 * @param {boolean} [config.devMode=process.env.NODE_ENV === 'development'] - Enable dev mode logging (affects `console.dev()` behavior).
 * @param {Object.<string, Function>} [config.customMethods={}] - Define custom logging methods (e.g., { customLog: (...args) => console.log('My special log:', ...args) }).
 * These methods will use `_originalConsole.log` by default.
 *
 * Public Console Methods:
 * - log(...args)
 * - success(...args)
 * - warn(...args)
 * - error(...args)
 * - info(...args)
 * - check(...args)
 * - skip(...args)
 * - connect(...args)
 * - disconnect(...args)
 * - dev()
 * - noPrefix()
 * - ...any custom methods defined
 *
 * Example Usage:
 * ```js
 * import ExtendedConsole from './ExtendedConsole.js';
 * const consoleEx = new ExtendedConsole({
 * useIconPack: true,
 * prefix: { // User-defined prefixes
 * customLog: '🌟',
 * anotherCustom: '➡️'
 * },
 * customMethods: {
 * customLog: (...args) => {
 * // The user's core logic for customLog.
 * // It will be automatically prefixed.
 * // The actual call to _originalConsole happens within the wrapper.
 * return args.join(' '); // Example: process args before they are logged
 * },
 * anotherCustom: (message, count) => {
 * return `Message: ${message}, Count: ${count}`;
 * }
 * }
 * });
 * await consoleEx.init();
 *
 * console.success('Build complete');
 * console.noPrefix().success('No prefix');
 * console.dev().log('Only in development');
 * console.customLog('This is my custom log!', 'With multiple args.'); // 🌟 This is my custom log! With multiple args.
 * console.noPrefix().customLog('Custom log without prefix.'); // Custom log without prefix.
 * console.dev().anotherCustom('Dev custom', 123); // ➡️ Dev custom 123 (if in dev mode)
 * ```
 */
class ExtendedConsole {
  constructor(config = {}) {
    this._originalConsole = { ...console };
    this.config = config; // Store original config

    this.usePrefix = config.usePrefix !== false;
    this.useDefaultPrefixes = config.useDefaultPrefixes !== false;
    this.defaultPrefixString = config.defaultPrefix || ""; // Ensure it's a string
    this.prefix = {}; // Will be populated by _initPrefix

    this.isDev =
      typeof config.devMode === 'boolean'
        ? config.devMode
        : process.env.NODE_ENV === 'development';

    this._customMethodNames = Object.keys(config.customMethods || {});

    // Define custom methods on the instance
    if (config.customMethods) {
      for (const methodName of this._customMethodNames) {
        if (typeof config.customMethods[methodName] === 'function') {
          if (this[methodName]) {
            this._originalConsole.warn(`[ExtendedConsole] Custom method '${methodName}' might overwrite an existing method.`)
          }
          // Wrap the user's custom method to handle prefixes and call the original console
          this[methodName] = (...args) => {
            const prefix = this._getPrefix(methodName);
            // The user's function might process args before they are logged
            const processedArgs = config.customMethods[methodName].apply(null, args); // Call user's function

            // Ensure processedArgs is an array for spreading
            const finalArgs = Array.isArray(processedArgs) ? processedArgs : [processedArgs];

            // By default, custom methods use _originalConsole.log
            // This could be made configurable if needed (e.g. per custom method)
            return this._originalConsole.log(...(prefix ? [prefix, ...finalArgs] : finalArgs));
          };
        } else {
           this._originalConsole.warn(`[ExtendedConsole] Custom method '${methodName}' is not a function and will be ignored.`);
        }
      }
    }
  }

  async init() {
    await this._initPrefix(this.config); // Pass original config
    this.overrideConsoleMethods();
  }

  async _initPrefix(config) { // config here is the original constructor config
    const userPrefix = typeof config.prefix === 'object' ? config.prefix : {};
    let resolvedPrefixMap = {};

    // Get built-in method names from the prototype
    const builtInMethods = Object.getOwnPropertyNames(ExtendedConsole.prototype).filter(
      (method) =>
        method !== 'constructor' &&
        method !== 'init' &&
        method !== '_initPrefix' &&
        method !== '_getPrefix' &&
        method !== 'overrideConsoleMethods' &&
        method !== 'dev' &&       // dev and noPrefix are special, not typical logging methods
        method !== 'noPrefix' &&
        typeof this[method] === 'function'
    );

    // Combine built-in and custom method names
    const allMethodNames = [...new Set([...builtInMethods, ...this._customMethodNames])];

    if (!this.usePrefix) {
      // If prefixes are globally disabled, set all to empty string
      for (const method of allMethodNames) {
        resolvedPrefixMap[method] = '';
      }
      this.prefix = resolvedPrefixMap;
      return;
    }

    let iconPack = null;
    if (config.useIconPack) {
      try {
        const imported = await import('@ultimaserve/emoji-icons');
        iconPack = imported.default || imported;
      } catch (e) { // Catch specific error
        this._originalConsole.warn('[ExtendedConsole] Could not load @ultimaserve/emoji-icons. Skipping icon pack.', e.message);
      }
    }

    for (const method of allMethodNames) {
      let prefixValue = ''; // Start with an empty prefix

      // 1. Check user-defined overrides first (from config.prefix)
      if (userPrefix.hasOwnProperty(method)) {
        prefixValue = userPrefix[method];
      }
      // 2. Else, check icon pack if enabled and mapping exists
      else if (iconPack && ICON_PACK_MAP[method] && iconPack[ICON_PACK_MAP[method]]) {
        prefixValue = iconPack[ICON_PACK_MAP[method]];
      }
      // 3. Else, check built-in defaults if enabled and available
      else if (this.useDefaultPrefixes && DEFAULT_PREFIXES[method]) {
        prefixValue = DEFAULT_PREFIXES[method];
      }
      // 4. Else, use the global defaultPrefixString (which could be empty)
      else {
        prefixValue = this.defaultPrefixString;
      }
      resolvedPrefixMap[method] = prefixValue;
    }
    this.prefix = resolvedPrefixMap; // No merge needed here as we iterated over all and applied hierarchy
  }

  _getPrefix(method) {
    // Handled by _initPrefix if usePrefix is false, all prefixes will be ''
    if (this._temporarilyDisablePrefix) return '';

    const prefixValue = this.prefix?.[method]; // Already resolved by _initPrefix

    // Only add a space if the prefix is not an empty string
    if (typeof prefixValue === 'string' && prefixValue !== '') {
      return prefixValue + ' ';
    }
    return ''; // Return empty string if prefix is empty or not found (should be found and be at least '')
  }

  // Standard methods - no change needed in their logic, they use _getPrefix
  log(...args) {
    const prefix = this._getPrefix('log');
    return this._originalConsole.log(...(prefix ? [prefix, ...args] : args));
  }

  success(...args) {
    const prefix = this._getPrefix('success');
    return this._originalConsole.log(...(prefix ? [prefix, ...args] : args));
  }

  warn(...args) {
    const prefix = this._getPrefix('warn');
    return this._originalConsole.warn(...(prefix ? [prefix, ...args] : args));
  }

  error(...args) {
    const prefix = this._getPrefix('error');
    return this._originalConsole.error(...(prefix ? [prefix, ...args] : args));
  }

  info(...args) {
    const prefix = this._getPrefix('info');
    return this._originalConsole.info(...(prefix ? [prefix, ...args] : args));
  }

  check(...args) {
    const prefix = this._getPrefix('check');
    return this._originalConsole.log(...(prefix ? [prefix, ...args] : args));
  }

  skip(...args) {
    const prefix = this._getPrefix('skip');
    return this._originalConsole.log(...(prefix ? [prefix, ...args] : args));
  }

  connect(...args) {
    const prefix = this._getPrefix('connect');
    return this._originalConsole.log(...(prefix ? [prefix, ...args] : args));
  }

  disconnect(...args) {
    const prefix = this._getPrefix('disconnect');
    return this._originalConsole.log(...(prefix ? [prefix, ...args] : args));
  }

  // dev and noPrefix methods
  dev() {
    if (!this.isDev) {
      // Return a proxy that no-ops for all method calls
      return new Proxy({}, { get: () => () => { /* no-op */ } });
    }
    // Return a proxy to `this` to allow chaining like console.dev().log()
    // The get handler ensures methods are correctly bound.
    return new Proxy(this, {
      get: (target, prop) => {
        if (typeof target[prop] === 'function') {
          return target[prop].bind(target);
        }
        return target[prop];
      }
    });
  }


  overrideConsoleMethods() {
    // Get built-in method names (excluding special ones)
    const builtInMethods = Object.getOwnPropertyNames(ExtendedConsole.prototype).filter(
      (method) =>
        method !== 'constructor' &&
        method !== 'init' &&
        method !== '_initPrefix' &&
        method !== '_getPrefix' &&
        method !== 'overrideConsoleMethods' &&
        method !== 'dev' &&        // Special handling for dev
        method !== 'noPrefix' &&   // Special handling for noPrefix
        typeof this[method] === 'function'
    );

    // Combine built-in and custom method names
    const allMethodNamesToOverride = [...new Set([...builtInMethods, ...this._customMethodNames])];

    for (const method of allMethodNamesToOverride) {
      if (typeof this[method] === 'function') { // Ensure method exists on instance
        console[method] = this[method].bind(this);
      } else {
        // This case should ideally not be hit if constructor and _initPrefix are correct
        this._originalConsole.warn(`[ExtendedConsole] Method '${method}' not found on instance during override.`);
      }
    }

    // Special proxy methods
    console.dev = () => this.dev();

    console.noPrefix = () => {
      return new Proxy(this, {
        get: (target, prop) => {
          if (typeof target[prop] === 'function') {
            return (...args) => {
              const previousState = target._temporarilyDisablePrefix;
              target._temporarilyDisablePrefix = true;
              const result = target[prop](...args); // Call the actual method on `this`
              target._temporarilyDisablePrefix = previousState;
              return result;
            };
          }
          return target[prop];
        },
      });
    };
  }
}

export default ExtendedConsole;