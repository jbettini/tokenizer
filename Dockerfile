# Image de base Rust officielle (version 1.79.0 pour compatibilité avec proc-macro2)
FROM rust:1.79.0-bookworm

# Installer les dépendances système
RUN apt-get update && apt-get install -y \
    build-essential \
    pkg-config \
    libssl-dev \
    libudev-dev \
    curl \
    git \
    fish \
    ca-certificates \
    wget \
    && rm -rf /var/lib/apt/lists/*

# Installer Solana CLI v1.18.16 avec binaires précompilés
RUN wget -O solana-release.tar.bz2 https://github.com/solana-labs/solana/releases/download/v1.18.16/solana-release-x86_64-unknown-linux-gnu.tar.bz2 \
    && tar jxf solana-release.tar.bz2 \
    && cp -r solana-release/bin/* /usr/local/bin/ \
    && rm -rf solana-release solana-release.tar.bz2 \
    && solana --version

# Installer Anchor CLI v0.30.0
RUN cargo install --git https://github.com/coral-xyz/anchor --tag v0.30.0 anchor-cli --locked \
    && anchor --version

# Installer Node.js 18 et yarn
RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash - \
    && apt-get install -y nodejs \
    && npm install -g yarn \
    && rm -rf /var/lib/apt/lists/* \
    && node --version && npm --version && yarn --version

# Configurer Solana pour devnet
RUN mkdir -p /root/.config/solana \
    && solana config set --url devnet

WORKDIR /workspace

# Point d'entrée avec fish shell
CMD ["fish"]
