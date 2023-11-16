import { useEffect,useState, useCallback } from 'react'
import { getContract, parseEther, zeroAddress } from 'viem'
import { useAccount, usePublicClient, useWalletClient } from 'wagmi'
import { HypercertClient, formatHypercertData, TransferRestrictions, } from "@hypercerts-org/sdk";

export const useCreateHypercert = (nftStorageApiKey: string) => {
    const { address } = useAccount()
    const publicClient = usePublicClient()
    const { data: walletClient, isError, isLoading } = useWalletClient()
    const [result, setResult] = useState(null)
    const [hash, setHash] = useState(null)



    const createHypercert = useCallback(async ({
        data, account, units, uri, restrictions
    }: {
        name: string
        account: `0x${string}`
        units: string
        uri: string
        restrictions: string
    }) => {
        const { data: metadata, valid, errors } = formatHypercertData({
            name: data.name,
            description: data.description,
            external_url: data.external_url,
            image: data.image,
            version: '1',
            impactScope: data.impactScope,
            excludedImpactScope: data.excludedImpactScope,
            workScope: data.workScope,
            excludedWorkScope: data.excludedWorkScope,
            workTimeframeStart: data.workTimeframeStart,
            workTimeframeEnd: data.workTimeframeEnd,    
            impactTimeframeStart: data.impactTimeframeStart,
            impactTimeframeEnd: data.impactTimeframeEnd,
            contributors: data.contributors,
            rights: data.rights,
            excludedRights: data.excludedRights
        })
        if (!valid) {
            return console.error(errors);
          }

        const transferRestrictions: TransferRestrictions = TransferRestrictions.FromCreatorOnly
        const totalUnits = BigInt(10000000)

        if (publicClient && address && walletClient) {
            const client = new HypercertClient({
                chainId: BigInt(10), // goerli testnet
                publicClient,
                walletClient,
                nftStorageToken: nftStorageApiKey,
              });
              const tx = await client.mintClaim(
                 metadata,
                 totalUnits,
                 transferRestrictions
              )
            setHash(tx)
            
        }
}, [publicClient, address, walletClient])

    return {
        createHypercert,
        result,
        hash,
    }
}