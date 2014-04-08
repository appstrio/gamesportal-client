Games Portal Client
=====================

## Using this project

1. Clone the repo

2. Install dependencies
```bash
$ npm install
```
3. Launch `gulp`, which builds files, watches them, runs a server at localhost:8080 (default)

4. Open browser at http://localhost:8080

5. $$$

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
