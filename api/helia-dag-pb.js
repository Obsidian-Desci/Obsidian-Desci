import * as codec from '@ipld/dag-pb'
import { CID } from 'multiformats/cid'
import { sha256 } from 'multiformats/hashes/sha2'

/**
 * we don't have a @helia/dag-pb yet, so this was simply copied over from @helia/dag-cbor and modified to work in js
 *
 * This has not been tested nor confirmed to work
 */

class DefaultDAGCBOR {
  /**
   * @type {DAGCBORComponents}
   */
  #components

  /**
   *
   * @param {DAGCBORComponents} components
   */
  constructor (components) {
    this.#components = components
  }

  async add (obj, options = {}) {
    const buf = codec.encode(obj)
    const hash = await (options.hasher ?? sha256).digest(buf)
    const cid = CID.createV1(codec.code, hash)

    await this.#components.blockstore.put(cid, buf, options)

    return cid
  }

  async get (cid, options = {}) {
    const buf = await this.#components.blockstore.get(cid, options)

    return codec.decode(buf)
  }
}

/**
 * Create a {@link DAGPB} instance for use with {@link https://github.com/ipfs/helia Helia}
 */
export function dagPb (helia) {
  return new DefaultDAGCBOR(helia)
}
