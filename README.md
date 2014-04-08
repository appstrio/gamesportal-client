Games Portal Client
=====================

## Using this project

1. Clone the repo
2. Install dependencies
```bash
$ sudo npm install http-server -g
$ sudo npm install
$ gulp
```
3.Start HTTP server
Open another terminal and run :
```bash
$ cd build
$ http-server
```
4. Launch in your browser http://localhost:8080/index.html


## Deploy

```bash
$ gulp deploy
```

This will deploy to the S3 bucket specified in the AWS config file (./ignored/aws.json)
Thr structure of the config file should follow this schema :
```json
{
    "key": "XXXX",
    "secret": "XXXX",
    "bucket": "XXXX"
}
```

