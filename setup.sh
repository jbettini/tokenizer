# **************************************************************************** #
#                                                                              #
#                                                         :::      ::::::::    #
#    setup.sh                                           :+:      :+:    :+:    #
#                                                     +:+ +:+         +:+      #
#    By: jbettini <jbettini@student.42.fr>          +#+  +:+       +#+         #
#                                                 +#+#+#+#+#+   +#+            #
#    Created: 2024/06/14 06:36:09 by jbettini          #+#    #+#              #
#    Updated: 2024/06/14 06:36:10 by jbettini         ###   ########.fr        #
#                                                                              #
# **************************************************************************** #

# Lancer un BlockChain cluster en tache de fond
solana-test-validator &
# setup le cluster par default
solana config set --url localhost
# solana config get/