添加vess订阅



```
vless://90407cc2afd34048aadff12992b34308@domain:443?encryption=none&security=tls&sni=domain&fp=randomized&type=ws&host=domain&path=%2F%3Fed%3D2048#domain
```



需要把上面的domain替换成自己的域名，上面内容构造格式如下

```
type: vless
name: mydomain.com
server: mydomain.com
port: 443
uuid: 90407cc2afd34048aadff12992b34308
network: ws
tls: true
udp: false
sni: mydomain.com
client-fingerprint: chrome
ws-opts:
path: “/?ed=2048”
headers:
host: mydomain.com
```

