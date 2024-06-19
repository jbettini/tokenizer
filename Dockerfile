# **************************************************************************** #
#                                                                              #
#                                                         :::      ::::::::    #
#    Dockerfile                                         :+:      :+:    :+:    #
#                                                     +:+ +:+         +:+      #
#    By: jbettini <jbettini@student.42.fr>          +#+  +:+       +#+         #
#                                                 +#+#+#+#+#+   +#+            #
#    Created: 2024/06/14 06:36:19 by jbettini          #+#    #+#              #
#    Updated: 2024/06/18 07:16:58 by jbettini         ###   ########.fr        #
#                                                                              #
# **************************************************************************** #

FROM ubuntu:latest

WORKDIR /



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

# RUN cargo install spl-token-cli

RUN curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.33.11/install.sh | bash
ENV NVM_DIR="/root/.nvm"
RUN . $NVM_DIR/nvm.sh && \
        nvm install "v18.18.0" && \
        nvm use "v18.18.0" && \
        nvm alias default node && \
        npm install -g yarn && \
        yarn add @solana/spl-token @metaplex-foundation/mpl-token-metadata

ARG NODE_VERSION="v18.18.0"
ENV PATH="/root/.cargo/bin:${PATH}"
ENV PATH="/root/.local/share/solana/install/active_release/bin:${PATH}"
ENV PATH="/root/.nvm/versions/node/${NODE_VERSION}/bin:${PATH}"

ENTRYPOINT fish

