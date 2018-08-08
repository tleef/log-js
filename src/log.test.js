/* eslint-env mocha */

import chai from 'chai'
import sinon from 'sinon'
import sinonChai from 'sinon-chai'

import log, { Logger, levels, main } from './log'

const expect = chai.expect

chai.use(sinonChai)

describe('log', () => {
  describe('levels', () => {
    it('should expose log levels', () => {
      expect(levels).to.deep.equal({
        ERROR: 500,
        WARN: 400,
        INFO: 300,
        DEBUG: 200,
        TRACE: 100
      })
    })
  })

  describe('Logger', () => {
    describe('#constructor()', () => {
      it('should be instantiable without arguments', () => {
        const l = new Logger()

        expect(l).to.be.an.instanceof(Logger)
      })

      it('should be instantiable with a parent', () => {
        const parent = new Logger()
        const l = new Logger(parent)

        expect(l).to.be.an.instanceof(Logger)
      })

      it('should have a defaultLevel of INFO', () => {
        const l = new Logger()

        expect(l.defaultLevel).to.equal(levels.INFO)
      })

      it('should inherit parent\'s defaultLevel', () => {
        const parent = new Logger().withDefaultLevel(123)
        const l = new Logger(parent)

        expect(l.defaultLevel).to.equal(123)
      })

      it('should have a level equal to it\'s defaultLevel', () => {
        const l = new Logger()

        expect(l.level).to.equal(l.defaultLevel)
      })

      it('should inherit parent\'s level', () => {
        const parent = new Logger().withLevel(123)
        const l = new Logger(parent)

        expect(l.level).to.equal(123)
      })

      it('should have empty meta', () => {
        const l = new Logger()

        expect(l.meta).to.deep.equal({})
      })

      it('should inherit clone of parent\'s meta', () => {
        let meta = {one: 1}
        let parent = new Logger().set('meta', meta)
        let l = new Logger(parent)

        expect(parent.meta).to.equal(meta)
        expect(l.meta).to.not.equal(parent.meta)
        expect(l.meta).to.deep.equal(parent.meta)
      })

      it('should throw if instantiated without new', () => {
        expect(() => Logger()).to.throw('Cannot call a class as a function')
      })

      it('should throw if parent is not a Logger', () => {
        let parent = {}

        expect(() => new Logger(parent)).to.throw('parent must be a Logger')
      })
    })

    describe('#set()', () => {
      it('should set key to value', () => {
        const l = new Logger()
        l.set('key', 'test')

        expect(l.key).to.equal('test')
      })

      it('should return the same Logger', () => {
        const l = new Logger()

        expect(l.set('key', 'test')).to.equal(l)
      })
    })

    describe('#withDefaultLevel', () => {
      it('should return new Logger', () => {
        const original = new Logger()
        const l = original.withDefaultLevel(123)

        expect(l).to.be.an.instanceof(Logger)
        expect(l).to.not.equal(original)
      })

      it('should set defaultLevel to given value', () => {
        const l = new Logger().withDefaultLevel(123)

        expect(l.defaultLevel).to.equal(123)
      })

      it('should throw if defaultLevel is not an Integer', () => {
        expect(() => new Logger().withDefaultLevel('123')).to.throw('defaultLevel must be an Integer')
      })
    })

    describe('#withLevel', () => {
      it('should return new Logger', () => {
        const original = new Logger()
        const l = original.withLevel(123)

        expect(l).to.be.an.instanceof(Logger)
        expect(l).to.not.equal(original)
      })

      it('should call set level to given value', () => {
        const l = new Logger().withLevel(123)

        expect(l.level).to.equal(123)
      })

      it('should throw if level is not an Integer', () => {
        expect(() => new Logger().withLevel('123')).to.throw('level must be an Integer')
      })
    })

    describe('#withMeta', () => {
      it('should return new Logger', () => {
        const original = new Logger()
        const l = original.withMeta({})

        expect(l).to.be.an.instanceof(Logger)
        expect(l).to.not.equal(original)
      })

      it('should clone given meta', () => {
        const meta = {key: 'test'}
        const l = new Logger().withMeta(meta)

        expect(l.meta).to.not.equal(meta)
        expect(l.meta).to.deep.equal(meta)
      })

      it('should extend current meta', () => {
        let l = new Logger().withMeta({one: 1}).withMeta({two: 2})

        expect(l.meta).to.deep.equal({one: 1, two: 2})
      })

      it('should override existing meta values', () => {
        let l = new Logger().withMeta({one: 1, two: 2}).withMeta({two: 'a', three: 'b'})

        expect(l.meta).to.deep.equal({one: 1, two: 'a', three: 'b'})
      })

      it('should throw if meta is not an Object', () => {
        expect(() => new Logger().withMeta()).to.throw('meta must be an Object')
      })
    })

    describe('#_log()', () => {
      beforeEach(() => { sinon.spy(console, 'log') })
      afterEach(() => { console.log.restore() })

      it('should call console.log', () => {
        new Logger()._log('test', {}, 1000)

        expect(console.log).to.have.callCount(1)
      })

      it('should not call console.log if level below log.level', () => {
        new Logger()._log('test', {}, 0)

        expect(console.log).to.have.callCount(0)
      })

      it('should log JSON', () => {
        new Logger()._log('test', {one: 1}, 1000)

        expect(console.log).to.have.been.calledWith(JSON.stringify({
          level: 1000,
          message: 'test',
          one: 1
        }))
      })

      it('should throw if message is not a String', () => {
        expect(() => new Logger()._log({}, {}, 100)).to.throw('message must be a non-empty String')
      })

      it('should throw if message is an empty String', () => {
        expect(() => new Logger()._log('', {}, 100)).to.throw('message must be a non-empty String')
      })

      it('should throw if meta is not an Object', () => {
        expect(() => new Logger()._log('test', 'meta', 100)).to.throw('meta must be an Object')
      })

      it('should throw if level is not an Integer', () => {
        expect(() => new Logger()._log('test', {}, '100')).to.throw('level must be an Integer')
      })
    })

    describe('#log()', () => {
      beforeEach(() => { sinon.spy(Logger.prototype, '_log') })
      afterEach(() => { Logger.prototype._log.restore() })

      it('should call #_log() with correct arguments', () => {
        let meta = {one: 1}
        let l = new Logger().withLevel(1000)
        l.log('test', meta, 123)

        expect(l._log).to.have.callCount(1)
        expect(l._log).to.have.been.calledWithExactly('test', meta, 123)
      })

      it('should log at default level', () => {
        let l = new Logger().withLevel(1000)
        l.log('test', {one: 1})

        expect(l._log.getCall(0).args[2]).to.equal(l.defaultLevel)
      })

      it('should be callable without meta', () => {
        let l = new Logger().withLevel(1000)
        l.log('test')

        expect(l._log.getCall(0).args[1]).to.deep.equal({})
      })
    })

    describe('#log.error()', () => {
      it('should call #log() with correct arguments', () => {
        let meta = {one: 1}
        let l = new Logger().withLevel(1000)
        sinon.spy(l, 'log')
        l.log.error('test', meta)

        expect(l.log).to.have.callCount(1)
        expect(l.log).to.been.calledWith('test', meta)
      })

      it('should log at the ERROR level', () => {
        let l = new Logger().withLevel(1000)
        sinon.spy(l, 'log')
        l.log.error('test')

        expect(l.log.getCall(0).args[2]).to.equal(levels.ERROR)
      })
    })

    describe('#log.warn()', () => {
      it('should call #log() with correct arguments', () => {
        let meta = {one: 1}
        let l = new Logger().withLevel(1000)
        sinon.spy(l, 'log')
        l.log.warn('test', meta)

        expect(l.log).to.have.callCount(1)
        expect(l.log).to.been.calledWith('test', meta)
      })

      it('should log at the WARN level', () => {
        let l = new Logger().withLevel(1000)
        sinon.spy(l, 'log')
        l.log.warn('test')

        expect(l.log.getCall(0).args[2]).to.equal(levels.WARN)
      })
    })

    describe('#log.info()', () => {
      it('should call #log() with correct arguments', () => {
        let meta = {one: 1}
        let l = new Logger().withLevel(1000)
        sinon.spy(l, 'log')
        l.log.info('test', meta)

        expect(l.log).to.have.callCount(1)
        expect(l.log).to.been.calledWith('test', meta)
      })

      it('should log at the INFO level', () => {
        let l = new Logger().withLevel(1000)
        sinon.spy(l, 'log')
        l.log.info('test')

        expect(l.log.getCall(0).args[2]).to.equal(levels.INFO)
      })
    })

    describe('#log.debug()', () => {
      it('should call #log() with correct arguments', () => {
        let meta = {one: 1}
        let l = new Logger().withLevel(1000)
        sinon.spy(l, 'log')
        l.log.debug('test', meta)

        expect(l.log).to.have.callCount(1)
        expect(l.log).to.been.calledWith('test', meta)
      })

      it('should log at the DEBUG level', () => {
        let l = new Logger().withLevel(1000)
        sinon.spy(l, 'log')
        l.log.debug('test')

        expect(l.log.getCall(0).args[2]).to.equal(levels.DEBUG)
      })
    })

    describe('#log.trace()', () => {
      it('should call #log() with correct arguments', () => {
        let meta = {one: 1}
        let l = new Logger().withLevel(1000)
        sinon.spy(l, 'log')
        l.log.trace('test', meta)

        expect(l.log).to.have.callCount(1)
        expect(l.log).to.been.calledWith('test', meta)
      })

      it('should log at the TRACE level', () => {
        let l = new Logger().withLevel(1000)
        sinon.spy(l, 'log')
        l.log.trace('test')

        expect(l.log.getCall(0).args[2]).to.equal(levels.TRACE)
      })
    })
  })

  describe('main', () => {
    it('should be a Logger', () => {
      expect(main).to.be.an.instanceof(Logger)
    })
  })

  describe('log()', () => {
    it('should equal main.log()', () => {
      expect(log).to.equal(main.log)
    })
  })
})
