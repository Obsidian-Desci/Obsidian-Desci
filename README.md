# Obsidian Lilypad
This is a [desci nodes](https://desci.com/), [lilypad](https://docs.lilypadnetwork.org/lilypad-v1-testnet/overview), [kamu](https://www.kamu.dev/) and [ipfs helia](https://github.com/ipfs/helia) plugin for Obsidian (https://obsidian.md).

[Video Demo](https://www.youtube.com/watch?v=H4Ww6vjLGj8&ab_channel=TaylorHulsmans)

[Pitch Deck](
https://create.piktochart.com/output/872ef3035912-purple-modern-status-reporting
)

[Paper](./Obsidian-Desci.pdf)

Pull Desci nodes, stream together external apis, run edge compute jobs by calling smart contracts, and fetch from ipfs all from the obsidian canvas.

The science tech stacks is due for an upgrade to enable collaboration and composability within an interface that is familiar and easy to understand.  Obsidian Lilypad ties together technologies from the emerging decentralized science ecosystem

Targeting enabling a composition pipeline for scientists that builds into their existing tools and is easy to use

**Note:** The Obsidian API is still in early alpha and is subject to change at any time!
### Config
- 
- Private Key - a private key for an ethereum address that has lil ETH on the lalechuza testnet
- Delegate Kubo - speed up pulling from ipfs by delegating content routing through a kubo node one runs separately in a terminal

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
![output](https://github.com/polus-arcticus/obsidian-lilypad/assets/122753557/76b74cfb-1e0b-4c72-9b2a-5b2a163b5399)

### In the Future
- IpfsDagify - create a Dag of connected canvas nodes and upload to ipfs
- IPFSremotePin - pin content by an external provider
- runKamu - create a custom lilypad job that merges the contents of two cids that reference a database
- Obsidian Sync IPFS - Underpin Obsidian Sync with IPFS
- Obsidian Multiplayer - Utilize IPFS pubsub over webrtc to enable reatime multiplayer on the canvaa
- LabDao protein folding workflow


```json
{
    "fundingUrl": "joe-mcgee.radicle.eth"
}
```

## API Documentation

See https://github.com/obsidianmd/obsidian-api
See https://docs.lilypadnetwork.org/lilypad-v1-testnet/overview
See https://docs.desci.com/learn/open-state-repository/pid
