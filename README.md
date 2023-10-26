<p align="center">
<img src="https://obsidian-desci.github.io/Docs/img/obsidian-desci-md-banner.png" />
</p>

# Obsidian-Desci


Web3 x Obsidian.md x DeSci

Pull From IPFS, Run Edge Compute Jobs by Calling Smart Contracts, Fetch Desci Nodes, and more to come!

📚 [Read the Docs](obsidian-desci.github.io/Docs/)

🎥 [Watch tutorial videos](https://www.youtube.com/@Obsidian-Desci-fs7uw)

🐦 [Follow on Twitter](https://twitter.com/Obsidian_Desci)

🌐 [Join Discord](https://discord.gg/3sFAbjF5uH)

The science tech stacks is due for an upgrade.  Enable collaboration and composability within an interface that is familiar and easy to understand.  Obsidian Desci ties together technologies from the emerging decentralized science ecosystem

### Config
- Private Key - a private key for an ethereum address that has lil ETH on the lalechuza testnet
- Kubo RPC - Run an IPFS Daemon in the background, set the gateway default here to use IPFS

### Commands
In a canvas, select a node and run hit Ctrl-P to search for
- runCowsay - execute cowsay on the content of a canvas node
- getDpid - pull a desci node from beta.dpid.org
- runSDXL - run stable diffusion by executing a transation through lilypad
- ipfsCat - pull the content from a CID from ipfs
- ipfsDagGet - pull a cid that references a dag and splay the child CIds into nodes
- ipfsAdd - Add a json object referenced by a CID
- ipfsKuboFetch - If helia cant fetch the content, one may have better luck calling the kubo rpc

## How to use

- Clone this repo. into the .obsidian/plugins folder of your vault
- Make sure your NodeJS is at least v16 (`node --version`).
- `npm i` or `yarn` to install dependencies.
- `npm run dev` to start compilation in watch mode.
- In a new terminal run `docker compose -f docker-compose.dev.yaml up to start the gateway api
- In obsidian hit Ctrl-P and type 'open settings'
- enable community plugins
- find obsidian-lilypad in the menu (may need to hit refresh to see it)
- hit the gear to open obsidian-lilypad settings, and add private key that has LILETH on the lalechuza testnet
- Create a new canvas
- use Ctrl-P and search the name of the command while a node is selected

### Hardhat

This repo has a hardhat environment under hardhat that can be used to build the Lilypad Client and run operation against the modicum contract directly

- `cd ./hardhat`
- `cp .env.example .env` and fill in your mnemonic

#### commands
`npx hardhat run ./scripts/getModuleCost.js --network lilypad` to retrieve current module costs

`npx hardhat run ./scripts/runFetchResults.js --network lilypad` to return the cids of the completed runs

`npx hardhat run ./scripts/runCowsay.js --network lilypad` to test the cowsay job



### add to community plugins
![output](https://github.com/Obsidian-Desci/Obsidian-Desci)

### In the Future
- IpfsDagify - create a Dag of connected canvas nodes and upload to ipfs
- IPFSremotePin - pin content by an external provider
- runKamu - create a custom lilypad job that merges the contents of two cids that reference a database
- Obsidian Sync IPFS - Underpin Obsidian Sync with IPFS
- Obsidian Multiplayer - Utilize IPFS pubsub over webrtc to enable reatime multiplayer on the canvaa
- LabDao protein folding workflow
- Hypercerts
- Nanopubs


```json
{
    "fundingUrl": "joe-mcgee.radicle.eth"
}
```

## API Documentation

See https://github.com/obsidianmd/obsidian-api

See https://docs.lilypadnetwork.org/lilypad-v1-testnet/overview

See https://docs.desci.com/learn/open-state-repository/pid

See https://docs.kamu.dev/cli/

See https://hypercerts.org/

See https://nanopub.net/


<p align="center">
<img src="https://obsidian-desci.github.io/Docs/img/obsidian-desci-logo.png" height="50px" />
</p>