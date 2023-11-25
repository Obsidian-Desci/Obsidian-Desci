import { useState, useCallback, useEffect } from 'react'
import { Root, createRoot } from "react-dom/client";
import { getContract, parseEther, zeroAddress, encodePacked,  } from 'viem'
import { 
    useInjectedWalletClient,
    useInjectedPublicClient,
    useInjected,
} from '../../Wallet/useInjected'
import { 
    useAccount,
    usePublicClient,
    useWalletClient,
    WagmiConfig,
} from 'wagmi'

import { useApp } from '../../hooks/useApp'
import { usePlugin } from '../../hooks/usePlugin'
import {address as clientAddress, abi as clientAbi} from '../../../artifacts/LilypadClient.json'

import { CanvasNode } from 'src/utils/canvas-internal'
import { TFile, MetadataCache } from 'obsidian';

export const useRunJob = (isInjected: boolean) => {
    const app  = useApp()
    const plugin = usePlugin()
    const publicClient  = isInjected ? 
        useInjectedPublicClient():
        usePublicClient()
    const { data: walletClient, isError, isLoading } = isInjected ?  useInjectedWalletClient() : useWalletClient()
    const { address } = isInjected ? useAccount() : useInjected()
    const [module, setModule] = useState<string>('')
    const [inputs, setInputs] = useState<any>([''])
    const [payee, setPayee] = useState<string>('')

    const [jobIdHash, setJobIdHash] = useState(null)
    const [jobId, setJobId] = useState<`0x${string}` | null>(null)
    const [resultData, setResultData] = useState(null)
    const [dealId, setDealId] = useState(null)
    const [dataId, setDataId] = useState(null)
    const [frontMatter, setFrontMatter] = useState(null)
    
    const fetchDefaultValues = useCallback(async() => {
        console.log('plugin', plugin)
        console.log('app', app)
        console.log('address', address)
        if (plugin && app&& address) {
            console.log('fetching default values', app)
            console.log(app.metadataCache,'metadata cache')
            if (plugin.unloaded) return

            plugin.logDebug("Running Cowsay")

            const canvas = plugin.getActiveCanvas()
            if (!canvas) {
                plugin.logDebug('No active canvas')
                return
            }
            const selection = canvas.selection
            console.log('canvas.selection', selection)
            if (selection?.size !== 1) return
            const values: CanvasNode[] = Array.from(selection.values())
            const node: CanvasNode = values[0]
            console.log('node', node)
            if(node) {
                const metadata = app.metadataCache.getFileCache(node.file).frontmatter
                setModule(metadata.module)
                setInputs((metadata.inputs))
                setPayee(metadata.payee === 'self' ? address : metadata.payee)
            }
        }


    }, [plugin, app, address])
    const fetchRunJob = useCallback(async ({
        initialModule,
        initialInputs,
        initialPayee
    }: {
        initialModule: string,
        initialInputs: any[],
        initialPayee: `0x${string}`
    } ) => {
        if (publicClient && address && walletClient) {
            const lilypadClient = getContract({
                address: clientAddress as `0x${string}`,
                abi: clientAbi,
                publicClient,
                walletClient,
            })
            console.log('initialInputs', initialInputs)
            const encodedInputs = initialInputs.map((input) => {
                const firstSplit = input.split("<");
                const thing = firstSplit[0]; // "thing"
                const secondSplit = firstSplit[1].split(">");
                const type = secondSplit[0]; // "type"
                console.log('type', type)
                const value = secondSplit[1].split("=")[1]; // "value"
                console.log('value', value)
                return String(encodePacked(
                    [type],
                    [value],
                ))
            })
            console.log('encodedInputs', encodedInputs)
            const jobIdHash = await lilypadClient.write.runJob([initialModule,encodedInputs,initialPayee])
            console.log('jobIdHash', jobIdHash)
            setJobIdHash(jobIdHash)
            const unwatch = lilypadClient.watchEvent.JobCreated({
                payee: initialPayee,
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
            setModule(initialModule)
            setInputs(initialInputs)
            setPayee(initialInputs)
        }
    }, [publicClient, address, walletClient])


    useEffect(() => {
        console.log('init fetch default values')
        fetchDefaultValues()
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