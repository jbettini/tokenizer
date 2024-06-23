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
	const mint = anchor.web3.Keypair.generate();

	it("mints nft!", async () => {
		const multisigKeys = new Array(3).fill(null).map(() => anchor.web3.Keypair.generate());
		const signerPubkeys = multisigKeys.map(key => key.publicKey);
		// const signerPubkeys = Array(3).fill(multisigKeys[0].publicKey); // error duplicate keys

		// create multisig
		const [multisigAccount] = anchor.web3.PublicKey.findProgramAddressSync(
			[
				Buffer.from("multisig"),
				mint.publicKey.toBuffer(),
			],
			program.programId,
		);
		tx('Create Mulsig Account', await program.methods
			.newMultisig(
				signerPubkeys,
				mint.publicKey,
			)
			.accounts({
				buyer: buyer.publicKey,
				mint: mint.publicKey,
			})
			.signers([mint])
			.rpc());
		
		tx('Create Transaction', await program.methods
			.newTransaction(
				buyer.publicKey,
			)
			.accounts({
				buyer: buyer.publicKey,
				multisigAccount,
			})
			.signers([buyer.payer])
			.rpc());


		const approveTransaction = async (approver: anchor.web3.Keypair) => {
			tx(`Approve Transaction`, await program.methods
				.approveTransaction()
				.accounts({
					approver: approver.publicKey,
					buyer: buyer.publicKey,
					multisigAccount,
				})
				.signers([approver])
				.rpc());
		};
		
		const metadata = {
			name: "MonkeyArt42MAYO",
			symbol: "MKA",
			uri: getUri(),
		};
		const associatedTokenAccount = await getAssociatedTokenAddress(
			mint.publicKey,
			buyer.publicKey
		);
		const executeTransaction = async () => {
			tx(`Execute Transaction`, await program.methods
				.execute(metadata.name, metadata.symbol, metadata.uri)
				.accounts({
					buyer: buyer.publicKey,
					mint: mint.publicKey,
					multisigAccount,
					associatedTokenAccount,
				})
				.signers([buyer.payer])
				.rpc());
		};

		// await approveTransaction(anchor.web3.Keypair.generate());
		// for (const owner of multisigKeys.slice(1)) {
		// 	await approveTransaction(owner);
		// }
		// await executeTransaction();
		// await approveTransaction(multisigKeys[0]);

		for (const owner of multisigKeys.slice(0)) {
			await approveTransaction(owner);
		}
		await executeTransaction();
	});
});