import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { SolanaNftAnchor } from "../target/types/solana_nft_anchor";
import { getAssociatedTokenAddress } from "@solana/spl-token";
// import { MPL_TOKEN_METADATA_PROGRAM_ID } from "@metaplex-foundation/mpl-token-metadata";
// import {
// 	TOKEN_PROGRAM_ID,
// 	ASSOCIATED_TOKEN_PROGRAM_ID,
// } from "@solana/spl-token";

const tx = (name: string, tx: string) => {
	console.log(`${name}: https://explorer.solana.com/tx/${tx}?cluster=devnet\n`);
}

function randomIntFromInterval(min, max): number {
	return Math.floor(Math.random() * (max - min + 1) + min);
}

function getUri(): string {
	let ret: string;
	let rng = randomIntFromInterval(1, 5);
	if (rng == 1){
		ret = "https://raw.githubusercontent.com/jbettini/Tokenizer/main/code/nft_data/1.json";
	} else if (rng == 2) {
		ret = "https://raw.githubusercontent.com/jbettini/Tokenizer/main/code/nft_data/2.json";
	} else if (rng == 3) {
		ret = "https://raw.githubusercontent.com/jbettini/Tokenizer/main/code/nft_data/3.json";
	} else if (rng == 4) {
		ret = "https://raw.githubusercontent.com/jbettini/Tokenizer/main/code/nft_data/4.json";
	} else if (rng == 5) {
		ret = "https://raw.githubusercontent.com/jbettini/Tokenizer/main/code/nft_data/5.json";
	}
	return ret;
}

describe("solana-nft-anchor", async () => {
	// Configured the client to use the devnet cluster.
	const provider = anchor.AnchorProvider.env();
	anchor.setProvider(provider);
	const program = anchor.workspace.SolanaNftAnchor as Program<SolanaNftAnchor>;
	const buyer = provider.wallet as anchor.Wallet;

	// test si exec sans signature - Avec une signature qui a pas le droit - plusieur fois avec la meme signature
	it("mints nft!", async () => {
		const multisigKeys = new Array(3).fill(null).map(() => anchor.web3.Keypair.generate());
		const signerPubkeys = multisigKeys.map(key => key.publicKey);

		// create multisig
		const multisigAccount =  anchor.web3.Keypair.generate();
		tx('Create Mulsig Account', await program.methods
			.newMultisig(signerPubkeys)
			.accounts({
				buyer: buyer.publicKey,
				multisigAccount: multisigAccount.publicKey,
			})
			.signers([multisigAccount])
			.rpc());

		// // // propose transac
		const [transaction] = anchor.web3.PublicKey.findProgramAddressSync(
			[
				Buffer.from("Transaction-Account"),
				buyer.publicKey.toBuffer(),
				multisigAccount.publicKey.toBuffer(),
			],
			program.programId,
		);
		
		tx('Create Transaction', await program.methods
			.newTransaction(
				buyer.publicKey,
				signerPubkeys,
			)
			.accounts({
				buyer: buyer.publicKey,
				multisigAccount: multisigAccount.publicKey,
			})
			.signers([buyer.payer])
			.rpc());

		// // approve transaction

		const approveTransaction = async (approver: anchor.web3.Keypair) =>{
			tx(`Approve Transaction`, await program.methods
				.approveTransaction()
				.accounts({
					approver: approver.publicKey,
					buyer: buyer.publicKey,
					multisigAccount: multisigAccount.publicKey,
				})
				.signers([approver])
				.rpc());
		};
		
		const metadata = {
			name: "MonkeyArt4242",
			symbol: "MKA",
			uri: getUri(),
		};

		const mint = anchor.web3.Keypair.generate();
		const associatedTokenAccount = await getAssociatedTokenAddress(
			mint.publicKey,
			buyer.publicKey
		);

		const executeTransaction = async () => {
			tx(`Execute Transaction`, await program.methods
				.execute(metadata.name, metadata.symbol, metadata.uri)
				.accounts({
					buyer: buyer.publicKey,
					transaction: transaction,
					multisigAccount: multisigAccount.publicKey,
					associatedTokenAccount: associatedTokenAccount,
				})
				.signers([buyer.payer])
				.rpc());
		};

		// Accept the transaction
		for (const owner of multisigKeys.slice(0)) {
			await approveTransaction(owner);
		}

		await executeTransaction();
	});
});