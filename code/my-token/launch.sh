#!/bin/bash

# Script de préparation pour anchor test --skip-build --skip-deploy
set -e

echo "🚀 Préparation du projet NFT Multisig pour les tests..."

# Couleurs pour les logs
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

cd /tokenizer/code/my-token

# 0. Restaurer le program keypair depuis le wallet
if [ -f /tokenizer/code/wallet/program-keypair.json ]; then
    echo -e "${BLUE}🔑 Restauration du program keypair...${NC}"
    mkdir -p target/deploy
    cp /tokenizer/code/wallet/program-keypair.json target/deploy/my_token-keypair.json
fi

# 1. Build sans IDL (contournement bug Anchor 0.30.1)
echo -e "${BLUE}📦 Build du programme (sans IDL)...${NC}"
anchor build --no-idl

# 2. Générer l'IDL manuellement
echo -e "${BLUE}📝 Génération de l'IDL manuel...${NC}"
python3 generate_idl.py

# 3. Déployer sur devnet
echo -e "${BLUE}🚢 Déploiement sur devnet...${NC}"
anchor deploy --provider.cluster devnet

# 4. Sauvegarder le program keypair
echo -e "${BLUE}💾 Sauvegarde du program keypair...${NC}"
cp target/deploy/my_token-keypair.json /tokenizer/code/wallet/program-keypair.json

echo -e "${GREEN}✅ Tout est prêt !${NC}"
echo -e "${GREEN}Program ID: 4q9zSqGHPwFquwgfMRMtsFWnFZYBzWbRFESXcAMyH4cE${NC}"
echo ""
echo -e "${BLUE}Tu peux maintenant lancer :${NC}"
echo -e "${GREEN}anchor test --skip-build --skip-deploy${NC}"
