#!/bin/bash
set -e

# Configuration Solana automatique
echo "🔧 Configuration de l'environnement Solana..."
solana config set --url devnet > /dev/null 2>&1 || true

# Vérifier si un wallet est spécifié
if [ -n "$ANCHOR_WALLET" ] && [ -f "$ANCHOR_WALLET" ]; then
    solana config set --keypair "$ANCHOR_WALLET" > /dev/null 2>&1 || true
    echo "✅ Wallet configuré: $ANCHOR_WALLET"
fi

# Afficher les versions installées
echo ""
echo "📦 Versions installées:"
echo "   • Rust:       $(rustc --version | cut -d' ' -f2)"
echo "   • Solana CLI: $(solana --version)"
echo "   • Anchor CLI: $(anchor --version)"
echo "   • Node.js:    $(node --version)"
echo "   • Yarn:       $(yarn --version)"
echo ""
echo "🎯 Cluster Solana: $(solana config get | grep 'RPC URL' | cut -d':' -f2- | xargs)"
echo ""
echo "✨ Prêt pour le développement Solana!"
echo ""

# Si des arguments sont passés, les exécuter, sinon lancer fish
if [ $# -eq 0 ]; then
    exec fish
else
    exec "$@"
fi
