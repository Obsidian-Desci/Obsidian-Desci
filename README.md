# Obsidian Sample Plugin

This is a [desci nodes](https://desci.com/), [lilypad](https://docs.lilypadnetwork.org/lilypad-v1-testnet/overview), and [ipfs helia](https://github.com/ipfs/helia) plugin for Obsidian (https://obsidian.md).

Pull Desci nodes, run edge compute jobs by calling smart contracts, and fetch from ipfs all from the obsidian canvas.

Targeting enabling a composition pipeline for scientists that builds into their existing tools and is easy to use

**Note:** The Obsidian API is still in early alpha and is subject to change at any time!
### Config
- Private Key - a private key for an ethereum address that has lil ETH on the lalechuza testnet
- Delegate Kubo - speed up pulling from ipfs by delegating content routing through a kubo node one runs separately in a terminal

### Commands
In a canvas, select a node and run hit Ctrl-P to search for
- Desci - pull a desci node from beta.dpid.org
- runSDXL - run stable diffusion by executing a transation through lilypad
- ipfsCAT - pull the content from a CID from ipfs

## How to use

- Clone this repo. into the .obsidian/plugins folder of your vault
- Make sure your NodeJS is at least v16 (`node --version`).
- `npm i` or `yarn` to install dependencies.
- `npm run dev` to start compilation in watch mode.

### add to community plugins
![output](https://github.com/polus-arcticus/obsidian-lilypad/assets/122753557/76b74cfb-1e0b-4c72-9b2a-5b2a163b5399)

```json
{
    "fundingUrl": "joe-mcgee.radicle.eth"
}
```

## API Documentation

See https://github.com/obsidianmd/obsidian-api
See https://docs.lilypadnetwork.org/lilypad-v1-testnet/overview
See https://docs.desci.com/learn/open-state-repository/pid
