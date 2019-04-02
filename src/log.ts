interface IMeta { [key: string]: any; }
interface ILogFn {
  error: LogLevelFn;
  warn: LogLevelFn;
  info: LogLevelFn;
  debug: LogLevelFn;
  trace: LogLevelFn;
}
export type LogFn = ILogFn & ((message: string, meta?: IMeta, level?: number) => void);
export type LogLevelFn = (message: string, meta?: IMeta) => void;

const ERROR = 500;
const WARN = 400;
const INFO = 300;
const DEBUG = 200;
const TRACE = 100;

const DEFAULT_LEVEL = INFO;

class Logger {
  get defaultLevel() {
    return this._defaultLevel;
  }

  get level() {
    return this._level;
  }

  get meta() {
    return this._meta;
  }

  public readonly log: LogFn;
  private  _defaultLevel: number;
  private _level: number;
  private _meta: IMeta;

  constructor(parent?: Logger) {
    if (!(this instanceof Logger)) {
      throw new Error("Cannot call a class as a function");
    }

    if (parent && !(parent instanceof Logger)) {
      throw new Error("parent must be a Logger");
    }

    this._defaultLevel = parent ? parent.defaultLevel : DEFAULT_LEVEL;
    this._level = parent ? parent.level : this.defaultLevel;
    this._meta = parent ? Object.assign({}, parent.meta) : {};

    const log = (message: string, meta = {}, level = this.defaultLevel) => {
      this._log(message, meta, level);
    };

    log.error = (message: string, meta: IMeta = {}) => {
      this.log(message, meta, ERROR);
    };

    log.warn = (message: string, meta: IMeta = {}) => {
      this.log(message, meta, WARN);
    };

    log.info = (message: string, meta: IMeta = {}) => {
      this.log(message, meta, INFO);
    };

    log.debug = (message: string, meta: IMeta = {}) => {
      this.log(message, meta, DEBUG);
    };

    log.trace = (message: string, meta: IMeta = {}) => {
      this.log(message, meta, TRACE);
    };

    this.log = log;
  }

  public withDefaultLevel(defaultLevel: number) {
    if (!Number.isInteger(defaultLevel)) {
      throw new Error("defaultLevel must be an Integer");
    }

    const l = new Logger(this);
    l._defaultLevel = defaultLevel;
    return l;
  }

  public withLevel(level: number) {
    if (!Number.isInteger(level)) {
      throw new Error("level must be an Integer");
    }

    const l = new Logger(this);
    l._level = level;
    return l;
  }

  public withMeta(meta: IMeta) {
    if (meta !== Object(meta)) {
      throw new Error("meta must be an Object");
    }

    const l = new Logger(this);
    l._meta = Object.assign({}, l.meta, meta);
    return l;
  }

  private _log(message: string, meta: IMeta, level: number) {
    if (!message || typeof message !== "string") {
      throw new Error("message must be a non-empty String");
    }

    if (meta !== Object(meta)) {
      throw new Error("meta must be an Object");
    }

    if (!Number.isInteger(level)) {
      throw new Error("level must be an Integer");
    }

    if (this.level > level) {
      return;
    }

    const data = Object.assign({}, this.meta, meta, {
      level,
      message,
    });

    console.log(JSON.stringify(data));
  }
}

const main = new Logger();
const levels = {
  DEBUG,
  ERROR,
  INFO,
  TRACE,
  WARN,
};

export default main.log;
export {
  Logger,
  main,
  levels,
};
