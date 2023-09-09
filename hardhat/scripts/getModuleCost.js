const hre = require('hardhat')

const clientLilypadAddr = process.env.CLIENT_ADDR

async function main() {
    const exampleClient = await hre.ethers.getContractAt("ExampleClient", clientLilypadAddr)
    const moduleCost = await exampleClient.getModuleCost('sdxl:v0.9-lilypad1')
    console.log(hre.ethers.formatEther(moduleCost))
}


main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});