// @ts-nocheck
import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { getAssociatedTokenAddress, TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID } from "@solana/spl-token";

// Metaplex Token Metadata Program ID
const TOKEN_METADATA_PROGRAM_ID = new anchor.web3.PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s");

const tx = (name: string, tx: string) => {
	console.log(`${name}: https://explorer.solana.com/tx/${tx}?cluster=devnet\n`);
}

describe("solana-nft-anchor", () => {
	// Configured the client to use the devnet cluster.
	const provider = anchor.AnchorProvider.env();
	anchor.setProvider(provider);
	const program = anchor.workspace.MyToken as Program<any>;
	const buyer = provider.wallet as anchor.Wallet;
	const mint = anchor.web3.Keypair.generate();

	it("mints nft!", async () => {
		const multisigKeys = new Array(3).fill(null).map(() => anchor.web3.Keypair.generate());
		const signerPubkeys = multisigKeys.map(key => key.publicKey);

		// create multisig
		const [multisigAccount] = anchor.web3.PublicKey.findProgramAddressSync(
			[
				Buffer.from("multisig"),
				mint.publicKey.toBuffer(),  // mint, not buyer!
			],
			program.programId,
		);
		tx('Create Mulsig Account', await program.methods
			.newMultisig(
				signerPubkeys,      // s: Vec<Pubkey>
				mint.publicKey,     // mint: Pubkey
			)
			.accounts({
				buyer: buyer.publicKey,
				mint: mint.publicKey,
				multisigAccount: multisigAccount,
				tokenProgram: TOKEN_PROGRAM_ID,
				systemProgram: anchor.web3.SystemProgram.programId,
			})
			.signers([mint])
			.rpc());
		
		const metadata = {
			name: "MonkeyJbettini42",
			symbol: "MKA",
			uri: "https://raw.githubusercontent.com/jbettini/Tokenizer/main/code/nft_data/1.json",
		};
		
		// Calculate transaction PDA
		const [transactionPda] = anchor.web3.PublicKey.findProgramAddressSync(
			[
				Buffer.from("create-transaction"),
				buyer.publicKey.toBuffer(),
				multisigAccount.toBuffer(),
			],
			program.programId,
		);
		
		tx('Create Transaction', await program.methods
			.newTransaction(
				buyer.publicKey,  // buyer: Pubkey
			)
			.accounts({
				multisigAccount: multisigAccount,
				transaction: transactionPda,
				buyer: buyer.publicKey,
				systemProgram: anchor.web3.SystemProgram.programId,
			})
			.rpc());


		const approveTransaction = async (approver: anchor.web3.Keypair) => {
			tx(`Approve Transaction`, await program.methods
				.approveTransaction()
				.accounts({
					transaction: transactionPda,
					multisig: multisigAccount,
					approver: approver.publicKey,
					buyer: buyer.publicKey,
				})
				.signers([approver])
				.rpc());
		};
		
		const associatedTokenAccount = await getAssociatedTokenAddress(
			mint.publicKey,
			buyer.publicKey
		);
		
		const [mintAuthority] = anchor.web3.PublicKey.findProgramAddressSync(
			[Buffer.from("mint_authority")],
			program.programId,
		);
		
		const [metadataAddress] = anchor.web3.PublicKey.findProgramAddressSync(
			[
				Buffer.from("metadata"),
				TOKEN_METADATA_PROGRAM_ID.toBuffer(),
				mint.publicKey.toBuffer(),
			],
			TOKEN_METADATA_PROGRAM_ID,
		);
		
		const executeTransaction = async () => {
			tx(`Execute Transaction`, await program.methods
				.execute(metadata.name, metadata.symbol, metadata.uri)
				.accountsStrict({
					buyer: buyer.publicKey,
					transaction: transactionPda,
					multisig: multisigAccount,
					mint: mint.publicKey,
					associatedTokenAccount: associatedTokenAccount,
					metadataAccount: metadataAddress,
					tokenProgram: TOKEN_PROGRAM_ID,
					associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
					tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
					systemProgram: anchor.web3.SystemProgram.programId,
					rent: anchor.web3.SYSVAR_RENT_PUBKEY,
				})
				.rpc());
		};		for (const owner of multisigKeys.slice(0)) {
			await approveTransaction(owner);
		}
		await executeTransaction();
	}, 15000);
});