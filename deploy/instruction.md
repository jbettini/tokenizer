**Deploying**

First install all dependencies with 
*yarn add --dev ts-mocha typescript @types/node @types/mocha && yarn add @solana/spl-token @metaplex-foundation/umi@^0.8.2 @solana/web3.js@^1.91.6 fastestsmallesttextencoderdecoder@^1.0.22* 

use *anchor test* inside /tokenizer/code/my-token,for build deploying and test the smart contract
Or use *anchor test --skip-deploy --skip-build* to only test

OR use *sh /tokenizer/deploy/deploy.sh*


Smart contract address :
*AaDFYp7PaMSPNdtA5B1fNEKvfNLLjAF3hMVUqZVhe1BF*
Network Used :
*Solana devnet*
