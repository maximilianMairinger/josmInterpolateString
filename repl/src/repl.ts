import josmInterpolateString from "./../../app/src/josmInterpolateString"
//const testElem = document.querySelector("#test")

const ecosystemConfigJsTemplate = `module.exports = {
  apps : [{
    script: "replServer/dist/server.js",
    name: "$[ branch / hash ].$[ name ]",
    exec_mode : "cluster",
    instances: 2,
    wait_ready: true,
    args: "--port $[ port ]"
  }]
}
`


josmInterpolateString(ecosystemConfigJsTemplate, {branch: "BRANCH", name: "NAME", port: "PORT", hash: "HASH"}).get(console.log)
