from algosdk import account, mnemonic
from algosdk.v2client import algod
from algosdk.future.transaction import StateSchema, ApplicationCreateTxn, OnComplete

# Configure connection to Algorand Node (Sandbox default)
algod_address = "http://localhost:4001"
algod_token = "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"

def get_client():
    return algod.AlgodClient(algod_token, algod_address)

def compile_program(client, source_code):
    compile_response = client.compile(source_code)
    return compile_response['result'], compile_response['hash']

def deploy_app():
    client = get_client()

    # Get account from mnemonic
    # REPLACE THIS WITH YOUR MNEMONIC
    creator_mnemonic = "YOUR TWENTY FIVE WORD MNEMONIC HERE"
    creator_sk = mnemonic.to_private_key(creator_mnemonic)
    creator_addr = account.address_from_private_key(creator_sk)

    # Read TEAL files
    with open("vote_approval.teal", "r") as f:
        approval_source = f.read()
    with open("vote_clear.teal", "r") as f:
        clear_source = f.read()

    # Compile
    approval_program, _ = compile_program(client, approval_source)
    clear_program, _ = compile_program(client, clear_source)

    # Decode compiled program
    import base64
    approval_program_bytes = base64.b64decode(approval_program)
    clear_program_bytes = base64.b64decode(clear_program)

    # Define Schema
    # Global: 2 Bytes (admin, merkle_root), 5 Ints (candidates) -> 7 total? No.
    # Actually: 
    # Bytes: admin (1), merkle_root (1) -> 2
    # Ints: candidate_1..5 -> 5
    global_schema = StateSchema(num_uints=5, num_byte_slices=2)
    local_schema = StateSchema(num_uints=0, num_byte_slices=0)

    # Create Application
    txn = ApplicationCreateTxn(
        sender=creator_addr,
        sp=client.suggested_params(),
        on_complete=OnComplete.NoOpOC,
        approval_program=approval_program_bytes,
        clear_program=clear_program_bytes,
        global_schema=global_schema,
        local_schema=local_schema,
        app_args=[b""] # Optional initial root
    )

    # Sign and Send
    signed_txn = txn.sign(creator_sk)
    tx_id = client.send_transaction(signed_txn)
    
    print(f"Deploying App... TxID: {tx_id}")
    
    # Wait for confirmation
    wait_for_confirmation(client, tx_id)

def wait_for_confirmation(client, txid):
    last_round = client.status().get('last-round')
    txinfo = client.pending_transaction_info(txid)
    while not (txinfo.get('confirmed-round') and txinfo.get('confirmed-round') > 0):
        print("Waiting for confirmation...")
        last_round += 1
        client.status_after_block(last_round)
        txinfo = client.pending_transaction_info(txid)
    print("Transaction {} confirmed in round {}.".format(txid, txinfo.get('confirmed-round')))
    print(f"App ID: {txinfo['application-index']}")

if __name__ == "__main__":
    deploy_app()
