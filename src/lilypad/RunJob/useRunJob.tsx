import { useState, useCallback, useEffect } from 'react'
import { Root, createRoot } from "react-dom/client";
import { getContract, parseEther, zeroAddress } from 'viem'
import { 
    useAccount,
    usePublicClient,
    useWalletClient,
    WagmiConfig
} from 'wagmi'

import { useApp } from '../../hooks/useApp'
import {address as clientAddress, abi as clientAbi} from '../../../artifacts/LilypadClient.json'

import { CanvasNode } from 'src/utils/canvas-internal'

export const useRunJob = () => {
    const app  = useApp()
    const publicClient  = usePublicClient()
    const { data: walletClient, isError, isLoading } = useWalletClient()
    const { address, isConnecting, isDisconnected } = useAccount()

    const [module, setModule] = useState(null)
    const [inputs, setInputs] = useState(null)
    const [payee, setPayee] = useState(null)

    const [jobIdHash, setJobIdHash] = useState(null)
    const [jobId, setJobId] = useState<`0x${string}` | null>(null)
    const [resultData, setResultData] = useState(null)
    const [dealId, setDealId] = useState(null)
    const [dataId, setDataId] = useState(null)
    const [frontMatter, setFrontMatter] = useState(null)
    
    const fetchDefaultValues = useCallback(() => {
        if (app) {

            if (app.unloaded) return

            app.logDebug("Running Cowsay")

            const canvas = app.getActiveCanvas()
            if (!canvas) {
                app.logDebug('No active canvas')
                return
            }
            const selection = canvas.selection
            if (selection?.size !== 1) return
            const values: CanvasNode[] = Array.from(selection.values())
            const node: CanvasNode = values[0]
            console.log('node', node)
            setModule(node.module)
            setInputs(node.inputs)
            setPayee(node.payee)
        }


    }, [app])
    const fetchRunJob = useCallback(async ({
        module,
        inputs,
        payee
    }: {
        module: string,
        inputs: string[],
        payee: `0x${string}`
    } ) => {
        setModule(module)
        setInputs(inputs)
        setPayee(payee)
        if (publicClient && address && walletClient) {
            const lilypadClient = getContract({
                address: clientAddress as `0x${string}`,
                abi: clientAbi,
                publicClient,
                walletClient,
            })
            const jobIdHash = await lilypadClient.write.runJob([module,inputs,payee])
            setJobIdHash(jobIdHash)

            const unwatch = await lilypadClient.watchEvent.JobCreated({
                payee: payee,
                module: module,
                inputs: inputs
            }, {
                onLogs: (logs) => {
                    console.log(logs)
                    setJobIdHash(logs)
                }
            })

            const unwatch2 = await lilypadClient.watchEvent.JobCompleted({
                id: jobIdHash,
            }, {
                onLogs: (logs) => {
                    console.log(logs)
                    setDealId(logs.dealId)
                    setDataId(logs.dataId)

                }
            })
        }
    }, [publicClient, address, walletClient])


    useEffect(() => {
        fetchDefaultValues
    }, [])

    return {
        fetchRunJob,
        jobIdHash,
        module,
        payee,
        inputs,
        jobId,
        dealId,
        dataId,

    }
}