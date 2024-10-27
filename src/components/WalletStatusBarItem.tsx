import { useAccount,  useConfig  } from "wagmi"
export const substringAddr = (address:`0x${string}`) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`
  }
  
export const WalletStatusBarItem = () => {
    
	const { chain, address, isConnected } = useAccount()
    const { chains } = useConfig()

    return (<>
    { isConnected ?
     (<span>{substringAddr(address as `0x${string}`)}</span>):
     (<span>Not Connected</span>)
    }
    { chain && <span>  {chain.name}</span>}

    </>)
}
