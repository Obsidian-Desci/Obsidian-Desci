import pkg from 'js-sha3'
const { keccak256 } = pkg
import { from } from 'multiformats/hashes/hasher'
import * as sha2 from 'multiformats/hashes/sha2'

export default async function getHasherForCode(code) {
    switch (code) {
        case sha2.sha256.code:
            return sha2.sha256
        case sha2.sha512.code:
            return sha2.sha512
        case 17:
            // git hasher uses sha1. see ipld-git/src/util.js
            return from({
                name: 'sha1',
                code,
                encode: async (data) => {
                    const crypto = globalThis.crypto ?? (await import('crypto')).webcrypto
                    const hashBuffer = await crypto.subtle.digest('SHA-1', data)
                    return new Uint8Array(hashBuffer)
                }
            })
        case 27: // keccak-256
            return from({
                name: 'keccak-256',
                code,
                encode: async (data) => {
                    return new Uint8Array(keccak256.arrayBuffer(data))
                }
            })

        default:
            throw new Error(`unknown multihasher code '${code}'`)
    }
}


async function getCidFromBytes(bytes, cidVersion, codecCode, multihashCode) {
    const hasher = await getHasherForCode(multihashCode)

    try {
        const hash = await hasher.digest(bytes)
        return CID.create(cidVersion, codecCode, hash)
    } catch (err) {
        console.error('could not create cid from bytes', err)
    }

    return ''
}
export async function verifyBytes(providedCid, bytes) {
    try {
        const cid = await getCidFromBytes(bytes, providedCid.version, providedCid.code, providedCid.multihash.code)

        if (cid.toString() !== providedCid.toString()) {
            throw new Error(`CID mismatch, expected '${providedCid.toString()}' but got '${cid.toString()}'`)
        }
    } catch (err) {
        console.error('unable to verify bytes', err)
        throw err
    }
}

function ensureGatewayFetchEnabled() {
    console.info('import.meta.env.NODE_ENV: ', import.meta.env.NODE_ENV)
    console.info(
        "🎛️ Customise whether ipld-explorer-components fetches content fro gateways by setting an `explore.ipld.gatewayEnabled` value to true/false in localStorage. e.g. localStorage.setItem('explore.ipld.gatewayEnabled', false) -- NOTE: defaults to true"
    )
    const gatewayEnabledSetting = localStorage.getItem('explore.ipld.gatewayEnabled')

    return gatewayEnabledSetting != null ? JSON.parse(gatewayEnabledSetting) : true
}

async function getRawBlockFromGateway (url, cid, signal) {
    const gwUrl = new URL(url)
    console.log('hi1', signal)
    gwUrl.pathname = `/ipfs/${cid.toString()}`
    gwUrl.search = '?format=raw' // necessary as not every gateway supports dag-cbor, but every should support sending raw block as-is
    try {
      const res = await fetch(gwUrl.toString(), {
        headers: {
          // also set header, just in case ?format= is filtered out by some reverse proxy
          Accept: 'application/vnd.ipld.raw'
        },
        cache: 'force-cache'
      })
      if (!res.ok) {
        throw new Error(`unable to fetch raw block for CID ${cid} from gateway ${gwUrl.toString()}`)
      }
      return new Uint8Array(await res.arrayBuffer())
    } catch (cause) {
      console.error('cause', cause)
      throw new Error(`unable to fetch raw block for CID ${cid}`)
    }
  }
export async function getBlockFromAnyGateway(cid, signal, moreGateways = []) {
    const gateways = moreGateways.concat(defaultGateways)
    for (const url of gateways) {
        if (signal.aborted) {
            throw new Error('aborted')
        }
        try {
            console.log('hello')
            const rawBlock = await getRawBlockFromGateway(url, cid, signal)
            try {
                await verifyBytes(cid, rawBlock)
                return rawBlock
            } catch (err) {
                console.error('unable to verify block from gateway', url)
                continue
            }
        } catch (err) {
            console.error('unable to get block from gateway', err)
            // ignore the error
        }
    }
    throw new Error('Could not get block from any gateway')
}

const defaultGateways = ['https://ipfs.io', 'https://dweb.link']