

# solana config get/

TODO in container

solana config set --url devnet && \
solana config set --keypair /tokenizer/code/wallet/keypair1.json

anchor deploy --provider.cluster https://api.devnet.solana.com --provider.wallet /tokenizer/code/client/wallet/keypair1.json

docker-compose run --rm tokenizer /bin/bash

anchor test --skip-build --skip-deploy