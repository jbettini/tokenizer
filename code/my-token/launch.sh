#!/bin/bash

set -e


echo -e "${GREEN}Launching...${NC}"

GREEN='\033[0;32m'
NC='\033[0m'

cd /tokenizer/code/my-token

if [ -f /tokenizer/code/wallet/program-keypair.json ]; then
    mkdir -p target/deploy
    cp /tokenizer/code/wallet/program-keypair.json target/deploy/my_token-keypair.json
fi

anchor build --no-idl
python3 generate_idl.py
anchor deploy --provider.cluster devnet
cp target/deploy/my_token-keypair.json /tokenizer/code/wallet/program-keypair.json
npm install
npm update

echo -e "${GREEN}anchor test --skip-build --skip-deploy${NC}"
