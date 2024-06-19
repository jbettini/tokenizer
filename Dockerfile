# **************************************************************************** #
#                                                                              #
#                                                         :::      ::::::::    #
#    Dockerfile                                         :+:      :+:    :+:    #
#                                                     +:+ +:+         +:+      #
#    By: jbettini <jbettini@student.42.fr>          +#+  +:+       +#+         #
#                                                 +#+#+#+#+#+   +#+            #
#    Created: 2024/06/14 06:36:19 by jbettini          #+#    #+#              #
#    Updated: 2024/06/19 10:07:41 by jbettini         ###   ########.fr        #
#                                                                              #
# **************************************************************************** #

FROM ubuntu:latest

WORKDIR /tokenizer

# ENV PATH="/root/.cargo/bin:${PATH}"
# ENV PATH="/root/.local/share/solana/install/active_release/bin:${PATH}"

# Installation et Maj des dependances
RUN apt-get update && apt-get install -y \
        build-essential \
        curl \
        git \
        libssl-dev \
        pkg-config \
        fish

# Installer Rust
RUN curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
ENV PATH="/root/.cargo/bin:${PATH}"

# Installer Solana CLI
RUN sh -c "$(curl -sSfL https://release.solana.com/stable/install)"
ENV PATH="/root/.local/share/solana/install/active_release/bin:$PATH" 
RUN solana-install update
RUN solana-install init 1.18.16

# Avm et Anchor
RUN cargo install --git https://github.com/coral-xyz/anchor avm --locked --force
RUN avm install latest && \
        avm use latest

# solana configs
RUN solana config set --url devnet && \
        solana config set --keypair /tokenizer/code/wallet/keypair1.json
        
# env sets
ARG NODE_VERSION="v18.18.0"
ENV PATH="/root/.nvm/versions/node/${NODE_VERSION}/bin:${PATH}"
ENV NVM_DIR="/root/.nvm"

# client dependencies
RUN curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.33.11/install.sh | bash
RUN . $NVM_DIR/nvm.sh && \
        nvm install ${NODE_VERSION} && \
        nvm use ${NODE_VERSION} && \
        nvm alias default node && \
        npm install -g yarn 
        
RUN yarn add --dev ts-mocha typescript @types/node @types/mocha && \
        yarn add @metaplex-foundation/umi \
                @metaplex-foundation/umi-bundle-defaults \
                @metaplex-foundation/umi-web3js-adapters \
                @metaplex-foundation/mpl-token-metadata@v3.0.0-alpha.24 \
                @metaplex-foundation/umi-signer-wallet-adapters \
                @solana/spl-token


ENTRYPOINT fish

