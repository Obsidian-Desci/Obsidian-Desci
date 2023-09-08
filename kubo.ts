import { createLibp2p, type Libp2p } from 'libp2p'
import { delegatedPeerRouting } from '@libp2p/delegated-peer-routing'
import { create as kuboClient } from 'kubo-rpc-client'

// default is to use ipfs.io
export const client = kuboClient({
  // use default api settings
  protocol: 'http',
  port: 5001,
  host: '127.0.0.1'
})


export const node  = async (): Promise<Libp2p<{x: Record<string, unknown>}>> => {
    const node = await createLibp2p({
    peerRouters: [
        delegatedPeerRouting(client)
    ]
    //.. other config
    })
    return node
    const peerInfo = await node.peerRouting.findPeer('peerid')
    console.log('peerInfo', peerInfo)

}