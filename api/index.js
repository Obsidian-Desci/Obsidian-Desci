// ESM
import util from 'util';
import { exec as Exec } from 'child_process'
const exec = util.promisify(Exec);
import { CID } from 'multiformats/cid'
import { createHelia } from 'helia'
import { dagJson } from '@helia/dag-json'
import { dagCbor } from '@helia/dag-cbor'

import Fastify from 'fastify'
import {initLibp2p} from './kubo.js'
import debug from 'debug'
// debug.enable('helia:*,libp2p:*')

import * as IpldDagJson from '@ipld/dag-json'
import * as IpldDagPB from '@ipld/dag-pb'
import * as IpldDagCbor from '@ipld/dag-cbor'

import {dagPb} from './helia-dag-pb.js'

let heliaNode;
let d;
let blockstore;
let datastore;
let libp2p;
let hiCid
const fastify = Fastify({
    logger: true
})

// @ts-check
const getOptions = {
  schema: {
    querystring: {
      cid: {type: 'string'}
    }
  }

}

const mapFromCidCodeToHeliaWrapper = new Map()


fastify.get('/', getOptions, async (request, reply) => {
  // console.log(request.query)
  console.log(`request.query: `, request.query);
  if (request.query.cid === undefined) {
    reply.type('application/json').code(500)
    return { error: 'no cid provided' }
  }
    // the hanging cid drawn from lilypad (for some reason works when using the chrome ipfs gateway extension and a running kubo node)
    // let Cid = CID.parse(String('QmY43r3bw9pJc28iFet42kAzVmtFuoa39kuxd4q4SG2gpz'))
    let Cid = CID.parse(request.query.cid)

    // need to find out what encoding is required for this CID
    if (!mapFromCidCodeToHeliaWrapper.has(Cid.code)) {
      reply.type('application/json').code(500)
      return {
        error: 'no codec found for cid',
        needsCodecCode: {
          decimal: Cid.code,
          hex: `0x${Cid.code.toString(16)}`,
        },
        tableOfCodes: 'https://github.com/multiformats/multicodec/blob/master/table.csv'
      }
    }


    // "project apollo archives" a cid i grabbed from the explore in the gateway (doesn't hang though i should probably us dag-cbor as the error is Error: CBOR decode error "but it doesn't hang")
    //let Cid = CID.parse(String('QmSnuWmxptJZdLJpKRarxBMS2Ju2oANVrgbr2xWbie9b2D'))
    console.log('home route ping')
    console.log(d.get(Cid))
    const res = await d.get(Cid, {
      // onProgress: (e) => console.log('progress', e)
    })
    console.log('res', res)
    reply.type('application/json').code(200)
    return res
})
fastify.get('/hi', async (request, reply) => {
    const res = await d.get(hiCid)
    console.log('res', res)
    reply.type('application/json').code(200)
    return { hello: 'world' }
})

fastify.get('/kamu', async (request, reply) => {
    // https://docs.kamu.dev/cli/collab/ipfs/
    let Cid = CID.parse(String('QmSnuWmxptJZdLJpKRarxBMS2Ju2oANVrgbr2xWbie9b2D'))
    try {
        const { stdout, stderr } = await exec(`kamu pull ${Cid.toString()}`);
        console.log('stdout', stdout)
        console.log('stderr', stderr)

    } catch (e) {
        console.log('error', e)
    }

})

fastify.addHook('onReady', async () => {
    console.log('booting');
    const {client, libp2p, blockstore, datastore} = await initLibp2p();
    heliaNode = await createHelia({
        libp2p,
        blockstore,
        datastore
    })
    console.log('helia created')
    d = dagJson(heliaNode)

    mapFromCidCodeToHeliaWrapper.set(IpldDagJson.code, d)
    console.log(`IpldDagJson.code: `, IpldDagJson.code);
    mapFromCidCodeToHeliaWrapper.set(IpldDagCbor.code, dagCbor(heliaNode))
    console.log(`IpldDagCbor.code: `, IpldDagCbor.code);
    // mapFromCidCodeToHeliaWrapper.set(IpldDagPB.code, dagPb(heliaNode))
    // console.log(`IpldDagPB.code: `, IpldDagPB.code);

    hiCid = await d.add({"hello": "world"})
    console.log(hiCid)

    // const result = await client.dag.get(CID.parse('QmY43r3bw9pJc28iFet42kAzVmtFuoa39kuxd4q4SG2gpz'))
    // console.log(`result: `, result);
    // for await (const data of client.cat('ipfs/QmY43r3bw9pJc28iFet42kAzVmtFuoa39kuxd4q4SG2gpz')) {
    //   console.log(data)
    // }
    //let Cid = CID.parse(String('QmPrszeDrL3rXD3LViZm4nWxz1HeaiyPr55PD99BajbCMS'))
    //const res = await d.get(Cid)

})

fastify.listen({ host:'0.0.0.0', port: 3000 }, async (err, address) => {
    if (err) throw err
    // Server is now listening on ${address}
})
