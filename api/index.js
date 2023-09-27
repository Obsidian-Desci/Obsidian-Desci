// ESM
import util from 'util';
import toBuffer from 'it-to-buffer'
import { exec as Exec } from 'child_process'
const exec = util.promisify(Exec);
import { CID } from 'multiformats/cid'
import { createHelia } from 'helia'
import { dagJson } from '@helia/dag-json'
import { dagCbor } from '@helia/dag-cbor'
import cors from '@fastify/cors'
import Fastify from 'fastify'
import debug from 'debug'
// debug.enable('helia:*,libp2p:*')
import * as IpldDagJson from '@ipld/dag-json'
import * as IpldDagPB from '@ipld/dag-pb'
import * as IpldDagCbor from '@ipld/dag-cbor'
import {dagPb} from './helia-dag-pb.js'
import { unixfs } from '@helia/unixfs'
import { sha256 } from 'multiformats/hashes/sha2'

import { toString as stringFromUint8Array  } from 'uint8arrays/to-string'
import {initLibp2p} from './kubo.js'
import {
   getBlockFromAnyGateway,

 } from './gateway.js';

let heliaNode;
let dJson;
let dCbor;
let dPb;
let fs;
const decoder = new TextDecoder()
let blockstore;
let datastore;
let libp2p;
let hiCid
const fastify = Fastify({
    logger: true
})

await fastify.register(cors, { 
  // put your options here
  origin: 'true'
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


fastify.post('/gateway', getOptions, async (request, reply) => {
  console.log(`request.query: `, request.query);
  if (request.query.cid === undefined) {
    reply.type('application/json').code(500)
    return { error: 'no cid provided' }
  }
  let Cid = CID.parse(request.query.cid, sha256.decoder)
  try {
    //const block = await getBlockFromAnyGateway(Cid, new AbortController())
    const res = await fetch(`http://0.0.0.0:5001/api/v0/dag/get?arg=${request.query.cid}&encoding=json`, {
      method: 'post',
      headers: {
        "Content-Type": "text/plain",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "X-Stream-Output, X-Chunked-Output, X-Content-Length",
        "Access-Control-Expose-Headers": "X-Stream-Output, X-Chunked-Output, X-Content-Length"
      }
    })

    //console.log('res', stringFromUint8Array(res.arrayBuffer))
    const json = await res.json()
    const stout = json.Links[3].Hash['/']
    console.log('stout', stout)
  
    const img = await fetch(`http://0.0.0.0:5001/api/v0/cat?arg=${stout}`, {
      method: 'post',
      headers: {
        "Content-Type": "text/plain",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "X-Stream-Output, X-Chunked-Output, X-Content-Length",
        "Access-Control-Expose-Headers": "X-Stream-Output, X-Chunked-Output, X-Content-Length"
      }
    })
    reply.type('img/png')
    return blob

    return n
    const imgJson = await img.json()
    console.log('img', imgJson)
    reply.type('application/json').code(200)
    return await res.json()
  } catch (e) {
    console.log('error:', e)
    reply.type('application/json').code(500)
    return { 'error': e}
  }

})


fastify.get('/', getOptions, async (request, reply) => {
  // console.log(request.query)
  console.log(`request.query: `, request.query);
  if (request.query.cid === undefined) {
    reply.type('application/json').code(500)
    return { error: 'no cid provided' }
  }
    // the hanging cid drawn from lilypad (for some reason works when using the chrome ipfs gateway extension and a running kubo node)
    // let Cid = CID.parse(String('QmY43r3bw9pJc28iFet42kAzVmtFuoa39kuxd4q4SG2gpz'))
    console.log(request.query.cid)
    let Cid = CID.parse(request.query.cid, sha256.decoder)
    console.log('code', Cid.code)
    console.log(mapFromCidCodeToHeliaWrapper)
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
    let res;
    for await (const buf of fs.cat(Cid)) {
      res += decoder.decode(buf, {
        stream: true
      })
    } 
    /*
    */
    //console.log(d.get(Cid))
    /*
    const res = await d.get(Cid, {
      onProgress: (e) => console.log('progress', e)
    })
    const res = await dCbor.get(Cid, {
      onProgress: (e) => console.log('cbor',e )
    }) 
   const res = await dPb.get(Cid, {
    onProgress: (e) => console.log('protobuffers', e)
   })
    */
    console.log('res', res)
    reply.type('application/json').code(200)
    return res
})
fastify.get('/dag', getOptions, async (request, reply) => {
  // console.log(request.query)
  console.log(`request.query: `, request.query);
  if (request.query.cid === undefined) {
    reply.type('application/json').code(500)
    return { error: 'no cid provided' }
  }
    // the hanging cid drawn from lilypad (for some reason works when using the chrome ipfs gateway extension and a running kubo node)
    // let Cid = CID.parse(String('QmY43r3bw9pJc28iFet42kAzVmtFuoa39kuxd4q4SG2gpz'))
    console.log(request.query.cid)
    let Cid = CID.parse(request.query.cid, sha256.decoder)
    console.log('code', Cid.code)
    console.log(mapFromCidCodeToHeliaWrapper)
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
    /*
    console.log('home route ping')
    let res;
    for await (const buf of fs.cat(Cid)) {
      res += decoder.decode(buf, {
        stream: true
      })
    } 
    */
    //console.log(d.get(Cid))
    /*
    const res = await d.get(Cid, {
      onProgress: (e) => console.log('progress', e)
    })
    const res = await dCbor.get(Cid, {
      onProgress: (e) => console.log('cbor',e )
    }) 
    */
   const res = await dPb.get(Cid, {
    onProgress: (e) => console.log('protobuffers', e)
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
    dJson = dagJson(heliaNode)
    dCbor= dagCbor(heliaNode)
    dPb = dagPb(heliaNode)
    fs = unixfs(heliaNode)


    mapFromCidCodeToHeliaWrapper.set(IpldDagJson.code, dJson)
    console.log(`IpldDagJson.code: `, IpldDagJson.code);
    mapFromCidCodeToHeliaWrapper.set(IpldDagCbor.code, dCbor)
    console.log(`IpldDagCbor.code: `, IpldDagCbor.code);
    mapFromCidCodeToHeliaWrapper.set(IpldDagPB.code, dPb)
    console.log(`IpldDagPB.code: `, IpldDagPB.code);

    hiCid = await dJson.add({"hello": "world"})
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
