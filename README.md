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

After building a version, use:

```bash
$ gulp deploy
```

Or using Amazon CLI:

```bash
$ aws s3 sync build/ s3://www.mojo-games.com --acl public-read --delete --size-only
```

With the AWS command line tool.
