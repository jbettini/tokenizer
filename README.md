# Tokenizer


42MbergerGiveMyMoneyBackPls

Blockchain used:    Solana 
reason:             Rust


1 - Init Project

Install Solana CLI : 
sh -c "$(curl -sSfL https://release.solana.com/v1.18.16/install)" ; export PATH="/Users/xtem/.local/share/solana/install/active_release/bin:$PATH"

Creation d'un dockerFile sous ubuntu

Dependance :
    - Curl
    - Rust, Cargo
    - Solana CLI
    - Avm, Anchor

Setup l'environemment Solana :
    - Lancer un Blockchain cluster en local et l'envoyer en tache de fond
    - Cree un Wallet de test
    - Ajouter des fond 














<!-- -------------------------------
| [Creation de tokens en CLI] |
-------------------------------
Creation du token + Mintage des tokens :

Creation d'un compte sur Chainstack

Connecter le client solana avec le https ENDPOINT grace a cette commande en CLI : solana config 
set --url https://nd-260-490-982.p2pify.com/3d59cc88b3a198e2050af2ab3b5ef7ce
Cree un wallet avec : solana-keygen new --outfile  ./wallet/keypair1.json
On pourra recupere la pubkey qui sera l'adresse de notre wallet

on lie notre client a notre wallet avec : 
solana config set --keypair ./wallet/keypair1.json 



Recuperer des solana de test avec un faucet 

cree un token avec : spl-token create-token
Enregistrer l'address du token 

ensuite il faudra créer un nouveau compte de token SPL :
spl-token create-account <ADDRESS DU TOKEN>

maintenant que tout est pret il faut frapper un nombre de token car si on fait 
spl-token supply <ADDRESS DU TOKEN>
on pourra voir que notre token existe en 0 exemplaire

spl-token mint <ADDRESS DU TOKEN> <Nombre D'exemplaire> -->
