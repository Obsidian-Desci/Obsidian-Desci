import { useEffect,useState, useCallback } from 'react'
import { getContract, parseEther, zeroAddress } from 'viem'
import { useAccount, usePublicClient, useWalletClient, useNetwork } from 'wagmi'
import { HypercertClient, formatHypercertData, TransferRestrictions } from "@hypercerts-org/sdk";
import { FormValues} from  './HypercertsCanvasNodeView'
export const useCreateHypercert = (nftStorageApiKey: string, web3StorageApiKey: string) => {
    const { address } = useAccount()
    const publicClient = usePublicClient()
    const { data: walletClient, isError, isLoading } = useWalletClient()
    const { chain } = useNetwork()
    const [result, setResult] = useState(null)
    const [hash, setHash] = useState(null)

    const createHypercert = useCallback(async (data: FormValues) => {
        console.log(data)
        console.log(data.impactScope)
        console.log('resolved values', data.impactScope.join(', '))
        const { data: metadata, valid, errors } = formatHypercertData({
            name: data.name,
            description: data.description,
            external_url: data.link,
            image: data.image,
            version: '1',
            impactScope: data.impactScope,
            excludedImpactScope: [],
            workScope: data.workScope,
            excludedWorkScope: [],
            workTimeframeStart: Math.floor(new Date(data.startDate).getTime() / 1000),
            workTimeframeEnd: Math.floor(new Date(data.endDate).getTime() / 1000),
            impactTimeframeStart: Math.floor(new Date(data.startDate).getTime() / 1000),
            impactTimeframeEnd: Math.floor(new Date(data.endDate).getTime() / 1000),
            contributors: data.contributors,
            rights: [],
            excludedRights: []
        })
        if (!valid) {
            return console.error(errors);
          }

        const transferRestrictions: TransferRestrictions = TransferRestrictions.FromCreatorOnly
        const totalUnits = BigInt(10000000)

        if (address && publicClient && address && walletClient && chain) {
            console.log('chain', chain)
            console.log('nftStorageApiKey', nftStorageApiKey)
            console.log('web3StorageApiKey', web3StorageApiKey)
            const client = new HypercertClient({
                chain: {
                    id: chain.id,
                }, // goerli testnet
                easContractAddress: '0x4200000000000000000000000000000000000021',
                publicClient,
                walletClient,
                nftStorageToken: nftStorageApiKey,
                web3StorageToken: web3StorageApiKey
              });
              console.log('client', client)
              const tx = await client.mintClaim(
                 metadata,
                 totalUnits,
                 transferRestrictions
              )
            
            setHash(tx)
            
        }
}, [address, publicClient, address, walletClient, chain])

    return {
        createHypercert,
        result,
        hash,
    }
}