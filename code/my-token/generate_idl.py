import json

# IDL qui matche EXACTEMENT le code Rust actuel
idl = {
  "address": "DZY3hVymQ5yzTeEJzuzTqrMqdH2iSWT1XBsLtnzBi2BU",
  "metadata": {"name": "my_token", "version": "0.1.0", "spec": "0.1.0"},
  "instructions": [
    {
      "name": "approve_transaction",
      "discriminator": [224, 39, 88, 181, 36, 59, 155, 122],
      "accounts": [
        {"name": "transaction", "writable": True},
        {"name": "multisig"},
        {"name": "approver", "signer": True},
        {"name": "buyer", "signer": True}
      ],
      "args": []
    },
    {
      "name": "new_multisig",
      "discriminator": [148, 150, 214, 133, 252, 109, 36, 236],
      "accounts": [
        {"name": "buyer", "writable": True, "signer": True},
        {"name": "mint", "writable": True, "signer": True},
        {"name": "multisig_account", "writable": True},
        {"name": "token_program"},
        {"name": "system_program"}
      ],
      "args": [
        {"name": "s", "type": {"vec": "pubkey"}},
        {"name": "mint", "type": "pubkey"}
      ]
    },
    {
      "name": "new_transaction",
      "discriminator": [146, 11, 177, 2, 249, 202, 151, 134],
      "accounts": [
        {"name": "multisig_account"},
        {"name": "transaction", "writable": True},
        {"name": "buyer", "writable": True, "signer": True},
        {"name": "system_program"}
      ],
      "args": [
        {"name": "buyer", "type": "pubkey"}
      ]
    },
    {
      "name": "execute",
      "discriminator": [130, 221, 242, 154, 13, 193, 189, 29],
      "accounts": [
        {"name": "buyer", "writable": True, "signer": True},
        {"name": "transaction", "writable": True},
        {"name": "multisig", "writable": True},
        {"name": "mint", "writable": True},
        {"name": "associated_token_account", "writable": True},
        {"name": "token_program"},
        {"name": "associated_token_program"},
        {"name": "system_program"},
        {"name": "rent"},
        {"name": "token_metadata_program"},
        {"name": "metadata_account", "writable": True}
      ],
      "args": [
        {"name": "name", "type": "string"},
        {"name": "symbol", "type": "string"},
        {"name": "uri", "type": "string"}
      ]
    }
  ],
  "accounts": [],
  "types": []
}

with open('/tokenizer/code/my-token/target/idl/my_token.json', 'w') as f:
    json.dump(idl, f, indent=2)

print("✅ IDL corrigé pour matcher le code Rust actuel!")
