import { Data, DataBase, DataSubscription } from "josm"
import xrray from "xrray"
import xtring from "xtring"
xrray()
xtring()

const token = {
  open: "$[",
  close: "]",
  escape: "$"
}


type Library = {[key in string]: string | Data<string>} | DataBase<{[key in string]: string}>
interface Activatable {
  activate(init?: boolean): this
  deactivate(): this
}

export function interpolateString(source: string, library: {[key in string]: Data<string>} | DataBase<{[key in string]: string}>, cb?: (s: string) => void, init?: boolean): Activatable
export function interpolateString(source: string, library: {[key in string]: string}): string
export function interpolateString(source: string, library: Library, cb?: (s: string) => void, init: boolean = true): any {

  let res = source
  let a = 0
  let subscriptions: DataSubscription<any>[] = []

  let subIndexStorage: number[] = []

  while (true) {
    let localStart = source.indexOf(token.open)
    let start = localStart + a

    if (localStart === -1) break
    if (source[localStart-1] === token.escape) {
      res = res.splice(start, 1, "")
      source = source.substr(localStart + 1)
      a = start
      continue
    }
    let localEnd = localStart + source.substr(localStart).indexOf(token.close) + 1
    if (localEnd === -1) break
    let end = localEnd + a
    let keysAsString = source.substring(localStart + token.open.length, localEnd - token.close.length).trim()

    let keys = keysAsString.split(".")
    let li: any = library
    if (keys.ea((key) => {
      li = li[key]
      if (li === undefined) return true
    })) li = keys.last


    let curInsert: string

    // FIXME: could be DataLink as well, do some other check to find out if data
    if (li instanceof Data) {
      curInsert = li.get()
      let mySubIndexStorageIndex = subIndexStorage.length
      subIndexStorage.add(start)
      subscriptions.add(li.get((newInsert: string) => {
        let start = subIndexStorage[mySubIndexStorageIndex]
        let omit = curInsert.length
        let delta = newInsert.length - omit
        curInsert = newInsert

        subIndexStorage.ea((e, i) => {
          if (e > start) subIndexStorage[i] = subIndexStorage[i] + delta
        })
        res = res.splice(start, omit, newInsert)

        cb(res)
      }, false))
    }
    else {
      curInsert = li
    }
    
    let omit = end - start
    res = res.splice(start, omit, curInsert)
    

    source = source.substring(localEnd)

    a = end - (omit - curInsert.length)

  }

  if (cb) {
    if (init) cb(res)

    return {
      activate(init?: boolean) {
        subscriptions.Inner("activate", [init])
        return this
      },
      deactivate() {
        subscriptions.Inner("deactivate", [])
        return this
      }
    }
  }
  else {
    return res
  }
}



export default interpolateString
