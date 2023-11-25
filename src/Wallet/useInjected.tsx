import { useState, useCallback, useEffect } from 'react'
import { createPublicClient, createWalletClient, http } from 'viem'
import {lilypad} from './config/LilypadChain'
import { privateKeyToAccount } from 'viem/accounts' 
import { PublicClient, WalletClient, parseEther  } from 'viem'
import { usePlugin } from '../hooks/usePlugin'
type GetPublicClientArgs = {
    /** Chain id to use for public client. */
    chainId?: number;
};
type UsePublicClientArgs = Partial<GetPublicClientArgs>;
declare function usePublicInjectedClient<TPublicClient extends PublicClient>({ chainId, }?: UsePublicClientArgs): TPublicClient;

export const useInjectedPublicClient = () => {
    return createPublicClient({
        chain: lilypad,
        transport: http(),
    })

}

export const useInjectedWalletClient = () => {
    const plugin = usePlugin()
    const [wallet,setWallet] = useState<any>()
    const fetchWallet = useCallback(async() => {
        if (plugin) {
            setWallet(() => createWalletClient({
                    account: privateKeyToAccount(plugin?.settings.privateKey as `0x${string}`),
                    chain: lilypad,
                    transport: http(),
                })
            ) 
        }
        }, [plugin])
        useEffect(() => {
            if (plugin && !wallet) fetchWallet()
        }, [plugin, wallet])

        return { wallet }
    }





export const useInjected = () => {

    const plugin = usePlugin()
    const [account, setAccount] = useState<any>()
    const [address,setAddress] = useState<any>()
    const [isConnected, setIsConnected] = useState(false)
    const fetchAddress = useCallback(async() => {
        if (plugin) {
            const account = privateKeyToAccount(plugin?.settings.privateKey as `0x${string}`)
            setAccount(account)
            setAddress(account.address)
            setIsConnected(true)

        }
        }, [plugin])
        useEffect(() => {
            if (plugin && !account) fetchAddress()
        }, [plugin, address])

        return { address, isConnected }

}

export const useInjectedDisconnect = () => {

    const plugin = usePlugin()
    const [account, setAccount] = useState<any>()
    const [address,setAddress] = useState<any>()
    const fetchAddress = useCallback(async() => {
        if (plugin) {
            const account = privateKeyToAccount(plugin?.settings.privateKey as `0x${string}`)
            setAccount(account)
            setAddress(account.address)
        }
    }, [plugin])

    return {
        disconnect: false
    }
}

export const useInjectedBalance = ({ address }: { address: `0x${string}`}) => {
    const publicCLient = useInjectedPublicClient()
    const walletClient = useInjectedWalletClient()
    const [data, setData] = useState<any>()
    const [isError, setIsError] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    
    const refetch = useCallback(async() => {
        if (publicCLient && walletClient && address) {
            const bal = await publicCLient.getBalance({
                address
            })
            setData({formatted: parseEther(bal.toString())})
            setIsLoading(false)
            setIsError(false)
        }
    }, [publicCLient, walletClient, address])

    useEffect(() => {
        if (publicCLient && walletClient && address) {
            refetch()
        }
    }, [publicCLient, walletClient, address])

    return {
        data,
        isError,
        isLoading,
        refetch
    }
}