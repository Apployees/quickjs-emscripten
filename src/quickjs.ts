import QuickJSModuleLoader from './quickjs-module'

const QuickJSModule = QuickJSModuleLoader()
const initialized = new Promise(resolve => { QuickJSModule.onRuntimeInitialized = resolve })

/**
 * QuickJSFFI contains `cwrap` declarations that expose C functions from the Emscripten module.
 */
class QuickJSFFI {
  eval: (code: string) => string = QuickJSModule.cwrap('eval', 'string', ['string'])
}

/**
 * QuickJS presents a Javascript interface to QuickJS, a Javascript interpreter that
 * supports ES2019.
 */
class QuickJS {
  private ffi = new QuickJSFFI()

  /**
   * Evaluate a string of Javascript code, returning its result.
   *
   * Note that the result is encoded with JSON, so a snippet that produces a cycle
   * will throw an exception inside QuickJS.
   */
  eval(code: string) {
    const result = this.ffi.eval(code)
    try {
      return JSON.parse(result)
    } catch(error) {
      throw result
    }
  }
}

let singleton: QuickJS | undefined = undefined

export async function getInstance() {
  await initialized
  singleton = singleton || new QuickJS()
  return singleton
}
