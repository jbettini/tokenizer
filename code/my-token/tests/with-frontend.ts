// @ts-nocheck
import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { getAssociatedTokenAddress, TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID } from "@solana/spl-token";
const { startServer, stopServer } = require('./simple-server.js');

// Metaplex Token Metadata Program ID
const TOKEN_METADATA_PROGRAM_ID = new anchor.web3.PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s");

describe("mint-with-frontend", () => {
	const provider = anchor.AnchorProvider.env();
	anchor.setProvider(provider);
	const program = anchor.workspace.MyToken as Program<any>;
	const buyer = provider.wallet as anchor.Wallet;

	it("launches frontend and waits for mint button click", async () => {
		console.log('\n✅ Starting NFT Minter Frontend...\n');
		
		// Promise qui sera résolue après le mint
		let resolveMint;
		const mintPromise = new Promise((resolve) => {
			resolveMint = resolve;
		});
		
		// Fonction de mint qui sera appelée quand on clique sur le bouton
		const performMint = async (storageType: string) => {
			const mint = anchor.web3.Keypair.generate();
			const multisigKeys = new Array(3).fill(null).map(() => anchor.web3.Keypair.generate());
			const signerPubkeys = multisigKeys.map(key => key.publicKey);
			
			console.log('\n✅ Minting NFT...');
			console.log('Storage Type:', storageType.toUpperCase());
			console.log('Mint Address:', mint.publicKey.toBase58());

			// Create multisig
			const [multisigAccount] = anchor.web3.PublicKey.findProgramAddressSync(
				[Buffer.from("multisig"), mint.publicKey.toBuffer()],
				program.programId,
			);
			
			await program.methods
				.newMultisig(signerPubkeys, mint.publicKey)
				.accounts({
					buyer: buyer.publicKey,
					mint: mint.publicKey,
					multisigAccount: multisigAccount,
					tokenProgram: TOKEN_PROGRAM_ID,
					systemProgram: anchor.web3.SystemProgram.programId,
				})
				.signers([mint])
				.rpc();
			
			console.log('✅ Multisig created');

			let uri: string;
			
			if (storageType === 'onchain') {
				// On-chain: encode metadata as data URI (limite 200 chars)
				// Utilise un lien court vers l'image IPFS
				const metadata = {
					name: "MonkeyJbettini42",
					symbol: "MKA",
					artist: "jbettini",
					image: "ipfs://QmX1AhnN5aTkAGXWY54FSqun3RuvMp3uMT8dxSfGiq82yn"
				};
				const jsonStr = JSON.stringify(metadata);
				const base64 = Buffer.from(jsonStr).toString('base64');
				uri = `data:application/json;base64,${base64}`;
				console.log('✅ Using on-chain storage (data URI)');
				console.log('URI length:', uri.length, 'chars (max 200)');
				
				if (uri.length > 200) {
					throw new Error(`URI too long: ${uri.length} chars (max 200)`);
				}
			} else {
				// IPFS: use Pinata gateway
				uri = "https://gateway.pinata.cloud/ipfs/bafkreiaete7j6dkezy6m5ehdfwacfkffgusun6qpxsskzciflhehpzbxfu";
				console.log('✅ Using IPFS storage (Pinata)');
			}

			const metadata = {
				name: "MonkeyJbettini42",
				symbol: "MKA",
				uri: uri,
			};

			// Create transaction
			const [transactionPda] = anchor.web3.PublicKey.findProgramAddressSync(
				[Buffer.from("create-transaction"), buyer.publicKey.toBuffer(), multisigAccount.toBuffer()],
				program.programId,
			);
			
			await program.methods
				.newTransaction(buyer.publicKey)
				.accounts({
					multisigAccount: multisigAccount,
					transaction: transactionPda,
					buyer: buyer.publicKey,
					systemProgram: anchor.web3.SystemProgram.programId,
				})
				.rpc();
			
			console.log('✅ Transaction created');

			// Approve transaction
			for (const owner of multisigKeys) {
				await program.methods
					.approveTransaction()
					.accounts({
						transaction: transactionPda,
						multisig: multisigAccount,
						approver: owner.publicKey,
						buyer: buyer.publicKey,
					})
					.signers([owner])
					.rpc();
			}
			
			console.log('✅ Transaction approved by all signers');

			const associatedTokenAccount = await getAssociatedTokenAddress(
				mint.publicKey,
				buyer.publicKey
			);

			const [metadataAddress] = anchor.web3.PublicKey.findProgramAddressSync(
				[Buffer.from("metadata"), TOKEN_METADATA_PROGRAM_ID.toBuffer(), mint.publicKey.toBuffer()],
				TOKEN_METADATA_PROGRAM_ID,
			);

			// Execute (mint!)
			await program.methods
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
				.rpc();

			console.log('\n✅ NFT Minted Successfully!');
			console.log('✅ View on Explorer:', `https://explorer.solana.com/address/${mint.publicKey.toBase58()}?cluster=devnet\n`);

			// Résoudre la promise pour terminer le test
			resolveMint();

			return {
				mint: mint.publicKey.toBase58(),
				metadata: metadataAddress.toBase58(),
				transaction: 'success'
			};
		};

		// Lancer le serveur web
		await startServer(performMint);
		
		console.log('✅ Waiting for button click... (test will timeout if no click)\n');
		
		// Attendre que le mint soit fait
		await mintPromise;
		
		// Arrêter le serveur
		await stopServer();

	}, 60000); // Timeout de 60 secondes
});
