# **************************************************************************** #
#                                                                              #
#                                                         :::      ::::::::    #
#    dependencies.sh                                    :+:      :+:    :+:    #
#                                                     +:+ +:+         +:+      #
#    By: jbettini <jbettini@student.42.fr>          +#+  +:+       +#+         #
#                                                 +#+#+#+#+#+   +#+            #
#    Created: 2024/06/14 06:00:29 by jbettini          #+#    #+#              #
#    Updated: 2024/06/14 06:25:04 by jbettini         ###   ########.fr        #
#                                                                              #
# **************************************************************************** #

# Installation et Maj des dependances
apt-get update && apt-get install -y \
    build-essential \
    curl \
    git \
    libssl-dev \
    pkg-config

# Installer Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
source $HOME/.cargo/env

# Installer Solana CLI
sh -c "$(curl -sSfL https://release.solana.com/stable/install)"
export PATH="/root/.local/share/solana/install/active_release/bin:$PATH"
solana-install update

# Avm et Anchor
cargo install --git https://github.com/coral-xyz/anchor avm --locked --force
avm install latest
avm use latest