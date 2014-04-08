Games Portal Client
=====================

## Using this project

1.Clone the repo

2.Install dependencies
```bash
$ sudo npm install
$ gulp
```
3.Launch in your browser http://localhost:8080/build/index.html


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

