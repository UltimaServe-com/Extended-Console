export type ConsoleMethod = (...args: any[]) => void;

export interface ConsolePrefixMap {
    [methodName: string]: string;
}

export interface CustomMethodMap {
    [methodName: string]: ConsoleMethod;
}

export interface ExtendedConsoleOptions {
    usePrefix?: boolean;               // Enable or disable prefixes (default: true)
    useDefaultPrefixes?: boolean;      // Use default emoji prefixes (default: true)
    useIconPack?: boolean;             // Load external emoji icon pack (default: false)
    prefix?: ConsolePrefixMap;         // Custom method-to-prefix mapping
    customMethods?: CustomMethodMap;   // Define custom log methods
    devMode?: boolean;                 // Define is running on developer mode or not (default: process.env.NODE_ENV === 'development')
}

export interface DefaultConsoleMethods {
    log: ConsoleMethod;
    success: ConsoleMethod;
    warn: ConsoleMethod;
    error: ConsoleMethod;
    info: ConsoleMethod;
    check: ConsoleMethod;
    skip: ConsoleMethod;
    connect: ConsoleMethod;
    disconnect: ConsoleMethod;
    [customMethod: string]: ConsoleMethod;
}

export interface Proxies {
    dev(): DefaultConsoleMethods;
    noPrefix(): DefaultConsoleMethods;
}

export default class ExtendedConsole implements DefaultConsoleMethods, Proxies {
    constructor(options?: ExtendedConsoleOptions)

    init(): Promise<void>;
}

// Extend the global Console type
declare global {
    interface Console extends DefaultConsoleMethods, Proxies { }
}

export { };