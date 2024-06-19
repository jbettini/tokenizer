import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { SolanaNftAnchor } from "../target/types/solana_nft_anchor";
import { walletAdapterIdentity } from "@metaplex-foundation/umi-signer-wallet-adapters";
import { getAssociatedTokenAddress } from "@solana/spl-token";
import {
	findMasterEditionPda,
	findMetadataPda,
	mplTokenMetadata,
	MPL_TOKEN_METADATA_PROGRAM_ID,
} from "@metaplex-foundation/mpl-token-metadata";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { publicKey } from "@metaplex-foundation/umi";

import {
	TOKEN_PROGRAM_ID,
	ASSOCIATED_TOKEN_PROGRAM_ID,
} from "@solana/spl-token";

function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

function getUri(): string {
  let ret: string;
  let rng = getRandomInt(5);
  rng += 1;
  if (rng == 1) {
    ret = "https://raw.githubusercontent.com/jbettini/Tokenizer/main/nft_image/1.json";
  } else if (rng == 2) {
    ret = "https://raw.githubusercontent.com/jbettini/Tokenizer/main/nft_image/2.json";
  } else if (rng == 3) {
    ret = "https://raw.githubusercontent.com/jbettini/Tokenizer/main/nft_image/3.json";
  } else if (rng == 4) {
    ret = "https://raw.githubusercontent.com/jbettini/Tokenizer/main/nft_image/4.json";
  }else if (rng == 5) {
    ret = "https://raw.githubusercontent.com/jbettini/Tokenizer/main/nft_image/5.json";
  }
  return ret;
  // https://raw.githubusercontent.com/[username]/[repository]/[branch]/[path_to_file]

}

describe("solana-nft-anchor", async () => {
	// Configured the client to use the devnet cluster.
	const provider = anchor.AnchorProvider.env();
	anchor.setProvider(provider);
	const program = anchor.workspace
		.SolanaNftAnchor as Program<SolanaNftAnchor>;

	const signer = provider.wallet;

	const umi = createUmi("https://api.devnet.solana.com")
		.use(walletAdapterIdentity(signer))
		.use(mplTokenMetadata());

	const mint = anchor.web3.Keypair.generate();

	// Derive the associated token address account for the mint
	const associatedTokenAccount = await getAssociatedTokenAddress(
		mint.publicKey,
		signer.publicKey
	);

	// derive the metadata account
	let metadataAccount = findMetadataPda(umi, {
		mint: publicKey(mint.publicKey),
	})[0];

	//derive the master edition pda
	let masterEditionAccount = findMasterEditionPda(umi, {
		mint: publicKey(mint.publicKey),
	})[0];



	const metadata = {
		name: "MonkeyArt",
		symbol: "MKA",
		uri: getUri(),
	};

	it("mints nft!", async () => {
		const tx = await program.methods
			.initNft(metadata.name, metadata.symbol, metadata.uri)
			.accounts({
				signer: provider.publicKey,
				mint: mint.publicKey,
				associatedTokenAccount,
				metadataAccount,
				masterEditionAccount,
				tokenProgram: TOKEN_PROGRAM_ID,
				associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
				tokenMetadataProgram: MPL_TOKEN_METADATA_PROGRAM_ID,
				systemProgram: anchor.web3.SystemProgram.programId,
				rent: anchor.web3.SYSVAR_RENT_PUBKEY,
			})
			.signers([mint])
			.rpc();

		console.log(
			`mint nft tx: https://explorer.solana.com/tx/${tx}?cluster=devnet`
		);
		console.log(
			`minted nft: https://explorer.solana.com/address/${mint.publicKey}?cluster=devnet`
		);
	});
});

// import * as anchor from "@coral-xyz/anchor";
// import { Program } from "@coral-xyz/anchor";
// import { MyToken } from "../target/types/my_token";

// describe("my-token", () => {
//   // Configure the client to use the local cluster.
//   anchor.setProvider(anchor.AnchorProvider.env());

//   const program = anchor.workspace.MyToken as Program<MyToken>;

//   it("Is initialized!", async () => {
//     // Add your test here.
//     const tx = await program.methods.initialize().rpc();
//     console.log("Your transaction signature", tx);
//   });
// });