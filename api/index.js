// ESM
import { CID } from 'multiformats/cid'
import { createHelia } from 'helia'
import { dagJson } from '@helia/dag-json'
import Fastify from 'fastify'
import {initLibp2p} from './kubo.js'

let heliaNode;
let d;
let blockstore;
let datastore;
let libp2p;
let hiCid
const fastify = Fastify({
    logger: true
})

fastify.get('/', async (request, reply) => {
    //let Cid = CID.parse(String('QmY43r3bw9pJc28iFet42kAzVmtFuoa39kuxd4q4SG2gpz'))
    let Cid = CID.parse(String('QmS6mcrMTFsZnT3wAptqEb8NpBPnv1H6WwZBMzEjT8SSDv'))
    console.log('home route ping')
    console.log(d.get(Cid))
    const res = await d.get(Cid)
    console.log('res', res)
    reply.type('application/json').code(200)
    return { hello: 'world' }
})
fastify.get('/hi', async (request, reply) => {
    const res = await d.get(hiCid)
    console.log('res', res)
    reply.type('application/json').code(200)
    return { hello: 'world' }
})

fastify.addHook('onReady', async () => {
    console.log('booting');
    ({libp2p, blockstore, datastore} = await initLibp2p());
    heliaNode = await createHelia({
        libp2p,
        blockstore,
        datastore
    })
    console.log('helia created')
    d = dagJson(heliaNode)
    hiCid = await d.add({"hello": "world"})
    console.log(hiCid)
    //let Cid = CID.parse(String('QmPrszeDrL3rXD3LViZm4nWxz1HeaiyPr55PD99BajbCMS'))
    //const res = await d.get(Cid)
    
})

fastify.listen({ host:'0.0.0.0', port: 3000 }, async (err, address) => {
    if (err) throw err
    // Server is now listening on ${address}
})
