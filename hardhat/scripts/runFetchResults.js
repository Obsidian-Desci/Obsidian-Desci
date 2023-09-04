const hre = require('hardhat')

const clientLilypadAddr = "0x59f1F1e6ca5C3ddB64E8dbBEa12f31D9236d7e64"

async function main() {
    const exampleClient = await hre.ethers.getContractAt("ExampleClient", clientLilypadAddr)
    const cowsay = await exampleClient.fetchAllResults()
    console.log(cowsay)
}


main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});