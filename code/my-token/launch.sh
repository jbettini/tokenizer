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

# 1. Build sans IDL (contournement bug Anchor 0.30.1)
echo -e "${BLUE}📦 Build du programme (sans IDL)...${NC}"
anchor build --no-idl

# 2. Générer l'IDL manuellement
echo -e "${BLUE}📝 Génération de l'IDL manuel...${NC}"
python3 generate_idl.py

# 3. Déployer sur devnet
echo -e "${BLUE}🚢 Déploiement sur devnet...${NC}"
anchor deploy --provider.cluster devnet

echo -e "${GREEN}✅ Tout est prêt !${NC}"
echo -e "${GREEN}Program ID: DZY3hVymQ5yzTeEJzuzTqrMqdH2iSWT1XBsLtnzBi2BU${NC}"
echo ""
echo -e "${BLUE}Tu peux maintenant lancer :${NC}"
echo -e "${GREEN}anchor test --skip-build --skip-deploy${NC}"
