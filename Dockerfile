# Utiliser Ubuntu 22.04 LTS comme base pour la stabilité
FROM ubuntu:22.04

# Définir le répertoire de travail
WORKDIR /app

# Arguments pour les versions
ARG ANCHOR_VERSION=v0.30.1 # Utiliser le tag Git
ARG NODE_VERSION=20.x

# Empêcher les invites interactives lors de l'installation
ENV DEBIAN_FRONTEND=noninteractive

# --- 1. Installation des dépendances système ---
RUN apt-get update && apt-get install -y \
    build-essential \
    curl \
    git \
    libssl-dev \
    pkg-config \
    fish \
    ca-certificates \
    gnupg \
    && rm -rf /var/lib/apt/lists/*

# --- 2. Installation de la dernière version stable de Rust ---
# Ceci est nécessaire pour que les dépendances d'Anchor CLI puissent se compiler.
ENV PATH="/root/.cargo/bin:${PATH}"
RUN curl --proto '=https' --tlsv1.2 -sSf --retry 5 --retry-delay 5 https://sh.rustup.rs | sh -s -- -y && \
    rustc --version

# --- 3. Installation de Node.js (via NodeSource) et Yarn ---
RUN mkdir -p /etc/apt/keyrings && \
    curl -fsSL --retry 5 --retry-delay 5 https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg && \
    echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_${NODE_VERSION} nodistro main" | tee /etc/apt/sources.list.d/nodesource.list && \
    apt-get update && apt-get install -y nodejs && \
    npm install -g yarn

# --- 4. Installation de Solana CLI via la nouvelle URL ANZA ---
ENV PATH="/root/.local/share/solana/install/active_release/bin:${PATH}"
RUN sh -c "$(curl -sSfL --retry 5 --retry-delay 5 https://release.anza.xyz/stable/install)" && \
    solana --version

# --- 5. Installation d'Anchor CLI directement avec Cargo (plus fiable) ---
RUN cargo install --git https://github.com/coral-xyz/anchor --tag ${ANCHOR_VERSION} anchor-cli && \
    anchor --version

# --- 6. Configuration de l'environnement pour Anchor ---
ENV ANCHOR_AVM_DISABLE=1
RUN solana config set --url devnet && \
    solana config get

# Changer le répertoire de travail pour le projet
WORKDIR /tokenizer

# Point d'entrée pour avoir un shell interactif dans le conteneur
ENTRYPOINT ["fish"]