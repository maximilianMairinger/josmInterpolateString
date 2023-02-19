import { Data, DataBase, DataSubscription } from "josm"
import xrray from "xrray"
import xtring from "xtring"
xrray()
xtring()

const defaultToken = {
  open: "$[",
  close: "]",
  escape: "$"
}


type Library = {[key in string]: string | Data<string> | Library} | DataBase<{[key in string]: string}>
type DataLibrary = {[key in string]: string | Data<string> | Library}
type PlainLibrary = {[key in string]: string | PlainLibrary}
type PlainKeyAssociation = {[keyFragment in string]: string}
type KeyAssociation = {[keyFragment in string]: string | Data<string>}

export function interpolateString(source: string | Data<string>, library: PlainLibrary, keyAssociation?: PlainKeyAssociation, token?: typeof defaultToken): Data<string>
export function interpolateString(source: string | Data<string>, library: DataBase<{[key in string]: string}>, keyAssociation?: KeyAssociation, token?: typeof defaultToken): Data<string>
export function interpolateString(source: string | Data<string>, library: DataLibrary, keyAssociation?: PlainKeyAssociation, token?: typeof defaultToken): Data<string>
export function interpolateString(source: string | Data<string>, library: Library, keyAssociation: KeyAssociation = {}, token: typeof defaultToken = defaultToken): Data<string> {

  if (typeof source === "string") return _interpolateString(source, library, keyAssociation, token)
  else {
    // this is a little dirty, but JOSM should unsub from the inner data when the outer data changes, so hopefully no memory leak :P
    const ret = new Data("")
    source.get((source) => {
      const end = _interpolateString(source, library, keyAssociation, token)
      end.get((end) => {
        ret.set(end)
      })
    })
    return ret
  }
  
}


function _interpolateString(source: string, library: Library, keyAssociation: KeyAssociation = {}, token: typeof defaultToken = defaultToken) {
  let returnData = new Data(source)
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
    let keys = keysAsString.split("/").replace(v => v.trim())

    
    let li = keys.ea((key) => {
      let keyFragments = key.split(".")
      let li: any = library
      if (!keyFragments.ea((keyFragment) => {
        if (keyAssociation[keyFragment] !== undefined) {
          keyFragment = keyAssociation[keyFragment] as any
          if ((keyFragment as any) instanceof Data) li = li(keyFragment)
          else li = li[keyFragment]
        }
        else li = li[keyFragment]
        if (li === undefined) return true
      })) return li
    })

    if (li === undefined) li = keys.first


    


    let curInsert: string

    // FIXME: could be DataLink as well, do some other check to find out if instanceof data
    if (li instanceof Data) {
      curInsert = li.get().toString()
      let mySubIndexStorageIndex = subIndexStorage.length
      subIndexStorage.add(start)
      subscriptions.add(li.get((newInsert: string) => {
        let start = subIndexStorage[mySubIndexStorageIndex]
        let omit = curInsert.length
        let delta = newInsert.length - omit
        curInsert = newInsert.toString()

        subIndexStorage.ea((e, i) => {
          if (e > start) subIndexStorage[i] = subIndexStorage[i] + delta
        })
        res = res.splice(start, omit, newInsert)

        returnData.set(res)
      }, false))
    }
    else {
      curInsert = li.toString()
    }
    
    let omit = end - start
    res = res.splice(start, omit, curInsert)
    

    source = source.substring(localEnd)

    a = end - (omit - curInsert.length)

  }

  returnData.set(res)

  return returnData
}



export default interpolateString
