const ERROR = 500
const WARN = 400
const INFO = 300
const DEBUG = 200
const TRACE = 100

const defaultLevel = INFO

class Logger {
  constructor (parent) {
    if (parent && !(parent instanceof Logger)) {
      throw new Error('parent must be a Logger')
    }

    this.defaultLevel = parent ? parent.defaultLevel : defaultLevel
    this.level = parent ? parent.level : this.defaultLevel
    this.meta = parent ? Object.assign({}, parent.meta) : {}

    this.log = (message, meta = {}, level = this.defaultLevel) => {
      this._log(message, meta, level)
    }

    this.log.error = (message, meta) => {
      this.log(message, meta, ERROR)
    }

    this.log.warn = (message, meta) => {
      this.log(message, meta, WARN)
    }

    this.log.info = (message, meta) => {
      this.log(message, meta, INFO)
    }

    this.log.debug = (message, meta) => {
      this.log(message, meta, DEBUG)
    }

    this.log.trace = (message, meta) => {
      this.log(message, meta, TRACE)
    }
  }

  set (key, value) {
    this[key] = value

    return this
  }

  withDefaultLevel (defaultLevel) {
    if (!Number.isInteger(defaultLevel)) {
      throw new Error('defaultLevel must be an Integer')
    }

    return new Logger(this).set('defaultLevel', defaultLevel)
  }

  withLevel (level) {
    if (!Number.isInteger(level)) {
      throw new Error('level must be an Integer')
    }

    return new Logger(this).set('level', level)
  }

  withMeta (meta) {
    if (meta !== Object(meta)) {
      throw new Error('meta must be an Object')
    }

    const l = new Logger(this)
    l.set('meta', Object.assign({}, l.meta, meta))
    return l
  }

  _log (message, meta, level) {
    if (!message || typeof message !== 'string') {
      throw new Error('message must be a non-empty String')
    }

    if (meta !== Object(meta)) {
      throw new Error('meta must be an Object')
    }

    if (!Number.isInteger(level)) {
      throw new Error('level must be an Integer')
    }

    if (this.level > level) {
      return
    }

    const data = Object.assign({
      level,
      message
    }, meta)

    console.log(JSON.stringify(data))
  }
}

const main = new Logger()
const levels = {
  ERROR,
  WARN,
  INFO,
  DEBUG,
  TRACE
}

export default main.log
export {
  Logger,
  main,
  levels
}
