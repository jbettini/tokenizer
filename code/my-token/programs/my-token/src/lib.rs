use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    token::{mint_to, Mint, MintTo, Token, TokenAccount},
    metadata::{
        create_metadata_accounts_v3, CreateMetadataAccountsV3, Metadata,
    },
};
use mpl_token_metadata::types::DataV2;
use std::convert::Into;

declare_id!("AaDFYp7PaMSPNdtA5B1fNEKvfNLLjAF3hMVUqZVhe1BF");

#[error_code]
pub enum ErrorCode {
    #[msg("Invalid Args to create Multisig Account.")]
    InvalidArgs,
    #[msg("Approver Not autorized.")]
    UnauthorizedApprover,
    #[msg("Execution Not Autorized: Not enought approver.")]
    UnauthorizedExecution,
}

#[account]
pub struct MultisigAccount {
    pub signers: Vec<Pubkey>,
    pub threshold: u64,
}

#[derive(Accounts)]
pub struct CreateMultisig<'info> {
    #[account(mut, signer)]
    pub buyer: Signer<'info>,
    #[account(
        init, 
        payer = buyer,
        space = 1024 * 8
    )]
    pub multisig_account: Account<'info, MultisigAccount>,
    #[account(
        init,
        payer = buyer,
        mint::decimals = 0,
        mint::authority = multisig_account.key(),
    )]
    pub mint: Account<'info, Mint>,
    pub system_program: Program<'info, System>,
}

#[account]
pub struct Transaction {
    pub buyer: Pubkey,
    pub signers: Vec<Pubkey>,
    pub approver: Vec<Pubkey>,
    pub exec: bool,
}
#[derive(Accounts)]
pub struct CreateTransaction<'info> {
    pub multisig_account: Account<'info, MultisigAccount>,
    #[account(
        init,
        payer = buyer,
        space = 1024 * 8,
        seeds = [
            b"create-transaction",
            buyer.key().as_ref(),
            multisig_account.key().as_ref(),
        ],
        bump
    )]
    pub transaction: Account<'info, Transaction>,
    #[account(mut)]
    pub buyer: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct ApproveTransaction<'info> {
    #[account(mut, 
        seeds = [
            b"create-transaction",
            buyer.key().as_ref(),
        ],
        bump
    )]
    pub transaction: Account<'info, Transaction>,
    #[account(signer)]
    pub approver: Signer<'info>,
    #[account()]
    pub buyer: Signer<'info>,
}

#[derive(Accounts)]
pub struct ExecuteTransaction<'info> {

    #[account(mut, signer)]
	pub buyer: Signer<'info>,


    #[account(mut)]
    pub transaction: Account<'info, Transaction>,


    // Signers 
    #[account(zero, signer)]
    multisig_account: Account<'info, MultisigAccount>,

    // Minting Account
    #[account(
        init,
        payer = buyer,
        mint::decimals = 0,
        mint::authority = multisig_account.key(),
    )]
    pub mint: Account<'info, Mint>,

    // Token Holder
    #[account(
        init_if_needed,
        payer = buyer,
        associated_token::mint = mint,
        associated_token::authority = buyer,
    )]
    pub associated_token_account: Account<'info, TokenAccount>,

    // Accounts needed
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
    
    pub token_metadata_program: Program<'info, Metadata>,

    // Metadata account
    #[account(
        mut,
        seeds = [
            b"metadata".as_ref(),
            mpl_token_metadata::ID.as_ref(),
            mint.key().as_ref(),
        ],
        bump,
        seeds::program = token_metadata_program.key()
    )]
    /// CHECK:
    pub metadata_account: UncheckedAccount<'info>,
}

#[program]
pub mod solana_nft_anchor {
    use super::*;

    pub fn new_multisig(
        ctx: Context<CreateMultisig>, 
        signers: Vec<Pubkey>
        ) -> Result<()> {
            // Rendre les signer unique
            if signers.is_empty() && signers.len() < 3 {
                return Err(ErrorCode::InvalidArgs.into());
            }
            let multisig: &mut Account<MultisigAccount> = &mut ctx.accounts.multisig_account;
            multisig.signers = signers;
            multisig.threshold = 3;
            Ok(())
    }

    pub fn new_transaction(
        ctx: Context<CreateTransaction>, 
        buyer: Pubkey, 
        signers: Vec<Pubkey>
        ) -> Result<()> {
            let transaction = &mut ctx.accounts.transaction;
            transaction.buyer = buyer;
            transaction.signers = signers;
            transaction.approver = Vec::new();
            transaction.exec = false;
            Ok(())
    }

    pub fn approve_transaction(ctx: Context<ApproveTransaction>) -> Result<()> {
        let transaction = &mut ctx.accounts.transaction;
        if transaction.signers.contains(&ctx.accounts.approver.key) && !transaction.approver.contains(&ctx.accounts.approver.key) {
            transaction.approver.push(*ctx.accounts.approver.key);
            if transaction.approver.len() >= 3  {
                transaction.exec = true;
            }
            Ok(())
        } else {
            return Err(ErrorCode::UnauthorizedApprover.into())
        }
    }

    pub fn execute(
        ctx: Context<ExecuteTransaction>,         
        name: String, 
        symbol: String, 
        uri: String
        ) -> Result<()> {
            let transaction = &mut ctx.accounts.transaction;
            if !transaction.exec {
                return Err(ErrorCode::UnauthorizedExecution.into());
            }
            let cpi_context = CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                MintTo {
                    mint: ctx.accounts.mint.to_account_info(),
                    to: ctx.accounts.associated_token_account.to_account_info(),
                    authority: ctx.accounts.multisig_account.to_account_info(),
                },
            );
            mint_to(cpi_context, 1)?;
            // Add Metadata
            let cpi_context = CpiContext::new(
                ctx.accounts.token_metadata_program.to_account_info(),
                CreateMetadataAccountsV3 {
                    metadata: ctx.accounts.metadata_account.to_account_info(),
                    mint: ctx.accounts.mint.to_account_info(),
                    mint_authority: ctx.accounts.multisig_account.to_account_info(),
                    update_authority: ctx.accounts.multisig_account.to_account_info(),
                    payer: ctx.accounts.buyer.to_account_info(),
                    system_program: ctx.accounts.system_program.to_account_info(),
                    rent: ctx.accounts.rent.to_account_info(),
                },
            );
            let data_v2 = DataV2 {
                name,
                symbol,
                uri,
                seller_fee_basis_points: 0,
                creators: None,
                collection: None,
                uses: None,
            };
            create_metadata_accounts_v3(cpi_context, data_v2, false, true, None)?;
            Ok(())
    }
}