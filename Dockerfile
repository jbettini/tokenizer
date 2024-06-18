# **************************************************************************** #
#                                                                              #
#                                                         :::      ::::::::    #
#    Dockerfile                                         :+:      :+:    :+:    #
#                                                     +:+ +:+         +:+      #
#    By: jbettini <jbettini@student.42.fr>          +#+  +:+       +#+         #
#                                                 +#+#+#+#+#+   +#+            #
#    Created: 2024/06/14 06:36:19 by jbettini          #+#    #+#              #
#    Updated: 2024/06/17 04:21:00 by jbettini         ###   ########.fr        #
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



ENTRYPOINT fish

