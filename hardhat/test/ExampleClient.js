const hre = require('hardhat')
const {main} = require('../scripts/deploy')


describe("Example Client", async () => {
    let accounts;
    let exampleClient;

    before(async () => {
        accounts = await hre.ethers.getSigners()
        const exampleClientAddr = await main()
        console.log('exampleaddr', exampleClientAddr)
        exampleClient  = await hre.ethers.getContractAt("ExampleClient", exampleClientAddr)
    })

    it("can talk to the modicum through lilypad fork", async () => {
        const test = await exampleClient.runCowsay('hello Cowsay', {
            value: hre.ethers.parseUnits('2', 'ether')
        })
        console.log('test', test)


    })
})

