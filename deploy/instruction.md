**Deploying**

First copy paste the folder mint use to store wallet private keys. 

Build the docker :
```
docker compose build
```

Connect to it :
```
docker compose run --rm --service-ports tokenizer
```

Now just go to /tokenizer/code/my-token and run the `launch.sh` script :

```
cd /tokenizer/code/my-token
bash launch.sh
```

Execute the following command to mint your nft :
```
anchor test --skip-build --skip-deploy
```

or to use a frontend

```
anchor test --skip-build --skip-deploy test/with-frontend.ts
```
