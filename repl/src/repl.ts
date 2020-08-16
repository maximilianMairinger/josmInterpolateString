import josmInterpolateString from "./../../app/src/josmInterpolateString"
//const testElem = document.querySelector("#test")

const preConfigFileContent = `
upstream nodejs_upstream_$[ port ] {
  server 127.0.0.1:$[ port ];
  keepalive 64;
}

server {

  listen 80;
                 
  server_name $[ domain ];

  location / {
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header Host $http_host;

    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";

    proxy_pass http://nodejs_upstream_$[ port ]/;
    proxy_redirect off;
    proxy_read_timeout 240s;
  }

}`

let conf = {
  appDest: '/var/www/html',
  nginxDest: '/etc/nginx',
  domain: 'd9780d6ced7e646b4c52bfb2c16655e383d38431.tingomaxochato.maximilian.mairinger.com',
  name: 'tingoMaxoChato',
  hash: 'd9780d6ced7e646b4c52bfb2c16655e383d38431',
  port: 5002,
  githubUsername: 'maximilianMairinger',
  modifier: 'd9780d6ced7e646b4c52bfb2c16655e383d38431',
  dir: '/var/www/html/tingoMaxoChato/d9780d6ced7e646b4c52bfb2c16655e383d38431'
}

debugger

//@ts-ignore
console.log(josmInterpolateString(preConfigFileContent, conf).get())
