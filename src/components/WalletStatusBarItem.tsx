import { useAccount, useNetwork  } from "wagmi"
export const substringAddr = (address:`0x${string}`) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`
  }
  
export const WalletStatusBarItem = () => {
    
	const { address, isConnected } = useAccount()
    const { chain, chains } = useNetwork()

    return (<>
    { isConnected ?
     (<span>{substringAddr(address as `0x${string}`)}</span>):
     (<span>Not Connected</span>)
    }
    { chain && <span>  {chain.name}</span>}

    </>)
}