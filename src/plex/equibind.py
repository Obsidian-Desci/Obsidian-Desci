from plex import CoreTools, plex_init, plex_run
import sys
import json
import os

dir_path = sys.argv[1]
protein_path = [f"{dir_path}/{sys.argv[2]}"]
small_molecule_path = [f"{dir_path}/{sys.argv[3]}"]
wallet_address = sys.argv[4]

os.environ["RECIPIENT_WALLET"] = wallet_address

initial_io_cid = plex_init(
    CoreTools.EQUIBIND.value,
    protein=protein_path,
    small_molecule=small_molecule_path,
)

completed_io_cid, io_local_filepath = plex_run(initial_io_cid, dir_path)
