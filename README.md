# Josm interpolate string

Josm string interpolation.

> Please not that Josm interpolate string is currently under development and not yet suited for production

## Installation

```shell
 $ npm i josm-interpolate-string
```

## Usage

Simple. Very simmilar to the native js implementation.

```ts
import interpolate from "josm-interpolate-string"

interpolate("Hello ${name}", { userName: "Max" }).get() // Hello Max
```

With changing values

```ts
import { DataBase } from "josm"

const lang = new DataBase({ 
  en: {
    greeting: "Hello",
    user: {
      handle: "Max"
    }
  }
})
 
const data = interpolate("${greeting} ${user.handle}", lang.en)

data.get() // Hello Max
lang.en.user.handle.set("John")
data.get() // Hello John

// or subscribe to changes
data.get((text) => {
  console.log(text) // Hello John [...]
})
```

## Contribute

All feedback is appreciated. Create a pull request or write an issue.
