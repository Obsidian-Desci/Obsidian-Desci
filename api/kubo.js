import { delegatedPeerRouting } from '@libp2p/delegated-peer-routing'
import { delegatedContentRouting } from '@libp2p/delegated-content-routing'
import { create as kuboClient } from 'kubo-rpc-client'
import { createLibp2p } from 'libp2p'
import { mplex } from '@libp2p/mplex'
import { tcp } from '@libp2p/tcp'
import { webRTC, webRTCDirect } from '@libp2p/webrtc'
import { webSockets } from '@libp2p/websockets'
import { webTransport } from '@libp2p/webtransport'
import { circuitRelayTransport } from 'libp2p/circuit-relay'
import { MemoryBlockstore } from 'blockstore-core'
import { MemoryDatastore } from 'datastore-core'
import { noise } from '@chainsafe/libp2p-noise'
import { yamux } from '@chainsafe/libp2p-yamux'
import { autoNATService } from 'libp2p/autonat'
import { identifyService } from 'libp2p/identify'
import { bootstrap } from '@libp2p/bootstrap'

export const client = kuboClient({
    // use default api settings
    host: '127.0.0.1',
    port: 5001,
    protocol: 'http',
})

export const initLibp2p = async () => {
    const blockstore = new MemoryBlockstore()
    const datastore = new MemoryDatastore()
    const libp2p = await createLibp2p({
        addresses: {
            listen: [
                '/ip4/127.0.0.1/tcp/0'
            ]
          },
        start: true, // TODO: libp2p bug with stop/start - https://github.com/libp2p/js-libp2p/issues/1787
        peerRouters: [
            delegatedPeerRouting(client)
        ],
        contentRouters: [
            delegatedContentRouting(client)
        ],
        datastore,
        transports: [
            tcp(),
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
        },
        peerDiscovery: [
            bootstrap({
              list: [
                '/dnsaddr/bootstrap.libp2p.io/p2p/QmNnooDu7bfjPFoTZYxMNLWUQJyrVwtbZg5gBMjTezGAJN',
                '/dnsaddr/bootstrap.libp2p.io/p2p/QmQCU2EcMqAqQPR2i9bChDtGNJchTbq5TbXJJ16u19uLTa',
                '/dnsaddr/bootstrap.libp2p.io/p2p/QmbLHAnMoJPWSCR5Zhtx6BHJX9KiKNN6tpvbUcqanj75Nb',
                '/dnsaddr/bootstrap.libp2p.io/p2p/QmcZf59bWwK5XFi76CZX8cbJ4BhTzzA3gU1ZjYZcYW3dwt',
                '/ip4/104.131.131.82/tcp/4001/p2p/QmaCpDMGvV2BGHeYERUEnRQAwe3N8SzbUtfsmvsqQLuvuJ'
              ]
            })]
        //.. other config
    })
    return { libp2p, blockstore, datastore }
}