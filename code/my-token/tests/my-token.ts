import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { SolanaNftAnchor } from "../target/types/solana_nft_anchor";
import { getAssociatedTokenAddress } from "@solana/spl-token";

const tx = (name: string, tx: string) => {
	console.log(`${name}: https://explorer.solana.com/tx/${tx}?cluster=devnet\n`);
}

describe("solana-nft-anchor", () => {
	// Configured the client to use the devnet cluster.
	const provider = anchor.AnchorProvider.env();
	anchor.setProvider(provider);
	const program = anchor.workspace.SolanaNftAnchor as Program<SolanaNftAnchor>;
	const buyer = provider.wallet as anchor.Wallet;
	const mint = anchor.web3.Keypair.generate();

	it("mints nft!", async () => {
		const multisigKeys = new Array(3).fill(null).map(() => anchor.web3.Keypair.generate());
		const signerPubkeys = multisigKeys.map(key => key.publicKey);

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
			name: "MonkeyJbettini42",
			symbol: "MKA",
			uri: "https://raw.githubusercontent.com/jbettini/Tokenizer/main/code/nft_data/1.json",
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
					// multisigAccount,
					associatedTokenAccount,
				})
				.signers([buyer.payer])
				.rpc());
		};

		for (const owner of multisigKeys.slice(0)) {
			await approveTransaction(owner);
		}
		await executeTransaction();
	}, 15000);
});