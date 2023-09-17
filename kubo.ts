import { createLibp2p, type Libp2p } from 'libp2p'
import { delegatedPeerRouting } from '@libp2p/delegated-peer-routing'
import { delegatedContentRouting } from '@libp2p/delegated-content-routing'
import { mplex } from '@libp2p/mplex'
import { webRTC, webRTCDirect } from '@libp2p/webrtc'
import { webSockets } from '@libp2p/websockets'
import { webTransport } from '@libp2p/webtransport'
import { create as kuboClient } from 'kubo-rpc-client'
import { circuitRelayTransport } from 'libp2p/circuit-relay'
import { MemoryBlockstore } from 'blockstore-core'
import { MemoryDatastore } from 'datastore-core'
import { noise } from '@chainsafe/libp2p-noise'
import { yamux } from '@chainsafe/libp2p-yamux'
import { autoNATService } from 'libp2p/autonat'
import { identifyService, type IdentifyService } from 'libp2p/identify'
// default is to use ipfs.io
export const client = kuboClient({
  // use default api settings
  protocol: 'http',
  port: 5001,
  host: '127.0.0.1',
  headers: {
    'Access-Control-Allow-Origin': "*",
    'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS, POST, PUT',
    //"Authorization": 'Bearer whatever'
  }
})


export const node = async (): Promise<{
  node: Libp2p<{ identify: IdentifyService; autoNAT: unknown; }>;
  blockstore: MemoryBlockstore;
  datastore: MemoryDatastore;
}> => {
  const blockstore = new MemoryBlockstore()
  const datastore = new MemoryDatastore()
  const node = await createLibp2p({
    start: true, // TODO: libp2p bug with stop/start - https://github.com/libp2p/js-libp2p/issues/1787
    peerRouters: [
      delegatedPeerRouting(client)
    ],
    contentRouters: [
      delegatedContentRouting(client)
    ],
    datastore,
    transports: [
      webRTC(),
      webRTCDirect(),
      webTransport(),
      webSockets(),
      circuitRelayTransport({
        discoverRelays: 1
      })
    ],
    connectionEncryption: [
      noise()
    ],
    streamMuxers: [
      yamux(),
      mplex()
    ],
    services: {
      identify: identifyService(),
      autoNAT: autoNATService()
    }
    //.. other config
  })
  return { node, blockstore, datastore }
  //const peerInfo = await node.peerRouting.findPeer('peerid')
  //console.log('peerInfo', peerInfo)

}