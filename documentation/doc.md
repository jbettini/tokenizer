# Tokenizer

## Function

Les fonction seront presenté sous leur format TS, leur format dans le smart contract auront pour difference le fzait juste d'etre en snake_case plutot qu'en camelCase

- *newMultisig*     : Cree un nouveau compte multisig qui aura l'autorité de mint
- *newTransaction*  : Permet a l'utilisateur de cree une demande de mintage qu'il pourra executer uniquement si il collecte 3 signature differente des personne qui on la propriete du multisigAccount
- *approveTransaction* : Permet au proprietaire de signer la transaction
- *execute* : Permet d'executer la transaction si les signature on ete collecter

## Vocabulary
- **Blockchain**: Technologie de stockage et decentraliser.
- **Smart Contract**: Program auto-exécutable dont le code est stocker sur une blockain.
- **NFT (Non-fungible Token)**: Un type de token unique cryptographique sur une blockchain.
- **Multisig (Multi-signature)**: Un type de signature numérique qui nécessite l'accord de plusieurs personnes avant d'exécuter une transaction.
- **Minting**: Le processus de création de nouveaux tokens sur la blockchain.


## Overview

**NFT-Usage**

La creation d'un Nft (Non-fungible Token) peut etre vue comme l'achat d'une oeuvre d'art numerique, mais en realite un NFT est un type de token crypto, que ce soit un élément de contenu numérique comme une œuvre d'art, une musique, ou tout autre actif numérique, l'acqueur possede une preuve indiscutable de propriété.
Par leur identité unique cela peut etre utiliser de diverse facon tel que un passdroit sur des projet ou des application de type smart contract, ou peuvent etre uniquement a caractere artistique.
En l'occurence ici notre token est purement artistique et permet de speculer sur une revente commercial.

**Project**

Nous allons faire un descriptif du fonctionnement du program :

D'abord nous devons initialiser un compte multisignature grace a la fonction *newMultisig*, ce compte sera detenteur du droit de mint.

Un client peut proposer une transaction avec la fonction *newTransaction*
cela va cree un compte transaction qui sera generer avec une seed unique a la transaction, le smart contract va lui specifier les utilisateur qui on le droit de signer pour eviter toute signature frauduleuse, des que 3 signature legit sont collecter.

Lorsque Une transaction est cree les Posseseur du compte multisign pourront choisir de signer la transaction avec la fonction *approveTransaction* une fois 3 signature collecter l'utilisateur pourra decider d'executer la transaction avec la fonction *execute* qui va mint un nft et le stocker sur un compte assosié et qui liera ce compte a la wallet de l'acheteur.




