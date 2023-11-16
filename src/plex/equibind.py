from plex import CoreTools, plex_init, plex_run, plex_vectorize, plex_mint
import sys
import json
import os
import py3Dmol

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
print("after plex_run")
print(completed_io_cid)
results = plex_vectorize(completed_io_cid, CoreTools.EQUIBIND.value, output_dir=dir_path)
print('after plex_vectorize')
best_docked_small_molecule_path = results['best_docked_small_molecule']['filePaths'][0]
best_docked_small_molecule_cid = results['best_docked_small_molecule']['cidPaths'][0]

print(results)
print("Docked Protein: ", best_docked_small_molecule_path.replace(dir_path, ""))
print(best_docked_small_molecule_cid)  

os.environ["AUTOTASK_WEBHOOK"] = "https://api.defender.openzeppelin.com/autotasks/e15b3f39-28f8-4d30-9bf3-5d569bdf2e78/runs/webhook/8315d17c-c493-4d04-a257-79209f95bb64/2gmqi9SRRAQMoy1SRdktai"

plex_mint(completed_io_cid)