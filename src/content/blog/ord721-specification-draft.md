---
author: tunnckoCore
pubDatetime: 2022-05-03T06:02:12Z
title: Specification v1.0 (DRAFT)
postSlug: spec
featured: true
description: The specification which you can follow to create and verify ORD-721 compatible Bitcoin Ordinals collections.
---

The easy part. What are the structures and types for ORD-721 protocol.

## Table of contents

## Protocol Interfaces

```typescript
interface ORD721Protocol {
  name: "ORD721";
  version: "1.0";
  type: "collection" | "token" | "royalty" | "funds" | "traits" | "tokens";
}

interface ORD721Collection {
  protocol: ORD721Protocol; // with type: 'collection'
  collection: {
    name: string;
    symbol: string;
    description: string;

    creatorAddress: string;
    creatorSignature: string;

    // mint price: 0 if free mint, could be an object too
    funds: number | ORD721Funds.funds;

    maxSupply?: number;
    maxPerAddress?: number;
    maxBlockHeight?: number;

    // if string, it's considered an inscription id to ORD721Royalty
    royalty?: string | ORD721Royalty.royalty;
    twitter?: string;
    discord?: string;
    website?: string;
  };

  hash: string;
}

interface ORD721Token {
  protocol: ORD721Protocol; // with type: 'token'
  token: {
    id: number;
    // if string, it's considered an inscription id to ORD721Traits
    traits?: string | { [key: string]: any | unknown };
    attributes?: any; // same as ERC721's attributes
    uri: string;
    dna?: string;
  };
  collectionHash: string;
  // in case of ORD721A we can inscribe the collection manifest early,
  // so we'll be able to have collectionInscriptionId for each token in advance
  collectionInscriptionId?: string;
  hash: string;
}

// optional
interface ORD721Royalty {
  protocol: ORD721Protocol; // with type: 'royalty'
  royalty: {
    address: string;
    amount: number;
    token: string; // empty if in satoshis
    // in case you want amount to be percent,
    // then add `type: 'percent'`
    type?: string;
  };
}

// optional
interface ORD721Funds {
  protocol: ORD721Protocol; // with type: 'funds'
  funds: {
    address: string; // the address where to send mint funds
    amount: number;
    token: string; // empty if in satoshis
  };
}

// optional
interface ORD721Traits {
  protocol: ORD721Protocol; // with type: 'traits'
  traits: {
    [key: string]: any | unknown;
  };
}
```

## The protocol field

The `protocol` field key is core, and is included in every inscription for easier tracking and understanding what to do.

It's like this

```json
{
  "protocol": {
    "name": "ORD721",
    "version": "1.0",
    "type": "collection"
  }
}
```

The `name` and `version` are constant, the `type` is one of `'collection'`, `'token'`, `'royalty'`, or `'collection_end'` (maybe `'tokens'` cuz it will hold all the tokens inscriptions ids). The name `collection_end` is still not final.

## `ORD721` for old collections

1. Create a `Collection` manifests for all existing collections (OrdinalsWallet repo)
2. Collect their inscription ids and their metadata (if any, eg. attributes)
3. Inscribe the collection's `Collection` manifest
4. Inscribe a finish manifest. Eventually.

_still work and more thoughts are needed here_

No need for "migration" in terms of re-inscribing old tokens/items. You just making them available to future platforms and services that will speak this language and protocol.

## `ORD721` for new collections

### Collection Manifest

A new collection is considered every collection that you just start and that you have all the needed content (like the items/images, traits and etc). Once you have all that, you are ready to go.

To start a new collection, through UI or not, you'll need to inscribe an initial `Collection` inscription. It will hold the configuration and metadata of a collection, like `name`, `symbol`, `description`, `maxSupply`, `maxPerAddress`, `royalty`, `creatorAddress`, `creatorSignature`, `paymentAddress`, and more. Most are optional, but are recommended.

**Example**

```json
{
  "protocol": {
    "name": "ORD721",
    "version": "1.0",
    "type": "collection"
  },
  "collection": {
    "name": "0xNeko Cats",
    "symbol": "neko",
    "description": "some description",
    "royalty": {
      "address": "bc1p12456",
      "amount": 1050,
      "token": "" // empty means it's in satoshis
    },
    // or link to external info
    //"royalty": "inscription_id_to_royalty_info",
    "maxSupply": 100,
    "maxPerAddress": 2,
    "maxBlockHeight": 770100,
    "creatorAddress": "bc1p12456",
    "creatorSignature": "GHj4539405un"
  },
  "hash": "675c676969b69696943645kl36j5463"
}
```

When all that is ready, a SHA hash of that content is made and added to it as `hash`. That hash then will be part of every `Token` inscription too.

For the `ORD721` **you don't inscribe that yet!**.  
For `ORD721A` you can inscribe it already.

### Token Manifest

A `Token` inscription is one that holds the actual NFT content (in form of data URI) and its metadata like attributes/traits, and token id.

For `ORD721` it's something like that

```json
{
  "protocol": {
    "name": "ORD721",
    "version": "1.0",
    "type": "token"
  },
  "token": {
    "id": 12,
    "traits": {
      "attr_name": "attr_value",
      "eyes": 2
    },
    "uri": "data:image/png;base64,<the base64 of the content>"
  },
  "collectionHash": "675c676969b69696943645kl36j5463",
  "hash": "191918282818jv4534"
}
```

For `ORD721A` it can also include `collectionInscriptionId`.

When end users are about to mint that token they sign that content, then a SHA hash of that content (including the signature of the minter) is created. Then that hash is added to the `Token` inscription JSON.

That token hash is then added to the `Collection` manifest.

All that hashing thing serves as a linking mechanism, ensuring content is linked to one another.

**`Collection` manifest after adding the `Token` hashes**

```json
{
  "protocol": {
    "name": "ORD721",
    "version": "1.0",
    "type": "collection"
  },
  "collection": {
    "name": "0xNeko Cats",
    "symbol": "neko",
    "description": "some description",
    "royalty": "inscription_id_to_royalty_info",
    "maxSupply": 100,
    "maxPerAddress": 2,
    "maxBlockHeight": 770100,
    "creatorAddress": "bc1p12456",
    "creatorSignature": "GHj4539405un"
  },
  "hash": "675c676969b69696943645kl36j5463",
  "tokens": {
    "1": {
      "hash": "hash_of_token_1"
    },
    "2": {
      "hash": "hash_of_token_2"
    },
    "12": {
      "hash": "191918282818jv4534"
    }
  }
}
```

Yes, this makes the creation of a collection to be a bit more complex and more expensive, but I'm thinking for a lighter solution called `ORD721A` in which the `Collection` manifest will not hold the hashes to every `Token`, but will require an "collection end" inscription when the minting finish - it will instead hold the inscription IDs of the inscribed `Token` inscriptions. Another difference in `ORD721A` will be that every `Token` will instead hold a pointer to the `Collection` inscriptionID instead of `collectionHash`.

### Collection End inscription (`type: 'tokens'`)

After all the minting finish, the creator or a service/platform should inscribe a collection "Finish", signalling and signifying that a collection finished minting and that you can start relying on that data instead of the first `Collection` inscription.

In the non `A` variant, it will be a copy of the `Collection` inscription, but also including `tokens` field, in which you have pointers between token ID and a corresponding token inscription id. In the `ORD721A` light variant, where there's no `tokens` inside the initial `Collection` inscription, you'll just have `tokens: { "1": { "inscription": "foo" } }`, eg. not including the `hash` of a token.

Like so

```json
{
  "protocol": {
    "name": "ORD721",
    "version": "1.0",
    "type": "tokens"
  },
  "collection": {
    "name": "0xNeko Cats",
    "symbol": "neko",
    "description": "some description",
    "royalty": "inscription_id_to_royalty_info",
    "maxSupply": 100,
    "maxPerAddress": 2,
    "maxBlockHeight": 770100,
    "creatorAddress": "bc1p12456",
    "creatorSignature": "GHj4539405un"
  },
  // the first inscription (`type: collection`) hash
  "hash": "675c676969b69696943645kl36j5463",
  "tokens": {
    "1": {
      "hash": "hash_of_token_1",
      "inscription": "inscription_id_of_token_1"
    },
    "2": {
      "hash": "hash_of_token_2",
      "inscription": "inscription_id_of_token_2"
    },
    "12": {
      "hash": "191918282818jv4534",
      "inscription": "inscription_id_of_token-12"
    }
  }
}
```

plus an updated collection `hash`.

## The lighter `ORD721A`

1. Show the creator a UI
2. Allow it to enter certain collection metadata
3. The creator can pass inscription id to a royalty info, or pass a new one
4. If it choose to pass a new one, then write the info as object to `royalty`
5. Create `Collection` manifest for the creator
6. Pass it to the creator to be signed
7. Update the `Collection` manifest to include the signature
8. Ask the creator to inscribe that manifest.
9. Once that `Collection` manifest gets inscribed, minters can start minting a `Token` inscriptions - or a platform can create a collection minting page, in which minters can click a button and a `Token` manifest will be created for them and they'll pay the inscription fee + the mint price (if any) of the NFT, which is defined in the `collection` metadata.
10. Creator should track by itself if a collection is sold/minted out or not
11. Otherwise, a platform can track on creator behalf and once it's sold/minted out ask the creator to inscribe a "collection end" manifest. This could also serve for granting a "verification badge" because it will be costly for big collections.

Doing all that manually is doable too. But automation and platforms are recommended.
It's the "necessary evil" for the sake of convenience. You cannot have totally verifiable and trustless flow, just because the nature of the system - anyone can copy and paste and inscribe whatever they want and as many times as they want. You'll always need an off-chain place where you can depend what's correct state, eg. what's the first inscription, what's "the latest", etc.

Plus, through a protocol you're not completely dependent on a single platform or database - the source of truth is still the blockchain. The plaftom's job is just to ease the things.

All we trying to do here is verify by complicating the things a bit, adding integrity SHA hashes, and forcing a minter/creator to sign a given data.  
We just rely on a shared common language between services, marketplaces, and apps.

All that is also applicable to "old collections", eg. the ones before the creation of this standard. The flow for it will be even more easier.
See [more here](#ord721-for-old-collections).

### Example `ORD721A` collection

Lets create an example collection that has a limit of 3 mints per address, has a supply of 2000, has a royalty of 6.9% configured, mint price is 42069 $PEPE BRC-20 tokens, and minting is opened only for 40 new blocks (eg. this is easily done through UI, the platform gets the latest block height, then adds some X to it)

Okay, we're going to inscribe the following

```json
{
  "protocol": {
    "name": "ORD721A",
    "version": "1.0",
    "type": "collection"
  },
  "collection": {
    "name": "Cats on Ordinals",
    "symbol": "catords",
    "description": "A cats collection on Bitcoin ordinals",
    "maxSupply": 2000,
    "maxPerAddress": 3,
    "maxBlockHeight": 800784, // consider latest is 800744

    // if `mintPrice` is a number, then it's considered amount in satoshis
    "funds": {
      "address": "bc1p_charity_wallet",
      "amount": 42069,
      // $PEPE token deploy inscription
      "token": "54d5fe82f5d284363fec6ae6137d0e5263e237caf15211078252c0d95af8943ai0"
    },

    // could be a string to an inscription id
    // that contains the info like `ORD721 Royalty` manifest
    "royalty": {
      "address": "bc1p_royalty_addr", // could be the `creatorAddress` too
      "amount": 6.9,
      "token": "", // empty means satoshis, but here we have `type: percent` too
      "type": "percent"
    },

    "creatorAddress": "bc1pk42g9szvyl7xxdpdszn5ql6ce2mzc0wmy05y97qfmu7hs8uftnns5tc37k",
    "creatorSignature": "HOi5mvhgifpbnLOri8rqpilCYGAv1QtHFh2xE69G0CwyDwQdmPvp+HlMh40vXhvuVx8x+49iYwwWxtaMSdwzMMw="
  },
  "hash": "ff8674d225d9018ccee26068b522f022d188dd71f6ff1658759d0870d8622eD12"
}
```

And we'll get some inscription id like `d0162e09766a998cd6ea192f66411befcd7ec3383111bbb42e20ca29899a3972i0`

So, we can start inscribing our NFTs.

```json
{
  "protocol": {
    "name": "ORD721A",
    "version": "1.0",
    "type": "token"
  },
  // could eventually be a string to inscription id? hm.
  "token": {
    "id": 1,
    //  eventually `traits` could also be a string to
    // a ORD721 Trait manifest inscription? hm.
    "traits": {
      "body": "green",
      "eyes": 3,
      "toy": "milk"
    },
    "uri": "data:image/png;base64,4jkh64k5j3h64536="
  },

  "collectionHash": "ff8674d225d9018ccee26068b522f022d188dd71f6ff1658759d0870d8622eD12",
  // in case of ORD721A we can inscribe the collection manifest early,
  // so we'll be able to have collectionInscriptionId for each token in advance
  "collectionInscriptionId": "d0162e09766a998cd6ea192f66411befcd7ec3383111bbb42e20ca29899a3972i0",

  // token hash
  "hash": "c2216d300a12e457c40ebb1979d3765fa75303705526084017d6fc32ad1ebfa9"
}
```

Btw, a side note: Hashes are easy. You can do it by writing the inscription manifest to a file and then call `sha256sum manifest.txt`.

## How platforms should visualize it?

Well, it's easy.

1. Listen for new inscriptions of `protocol.name` == `ORD721` or `ORD721A`.
2. Consider what version you support
3. If `type: 'collection'` then create a page for it, then when new `type: 'token'` inscriptions happen start adding them there. All that can be done automatically in UI.
4. When you detect a new `type: token` then you can take info from the `token` field, in which you have all the needed data for that NFT.
5. Get the `token.uri` and put it on `src` of `iframe` HTML element or something. You might need to parse the mimetype before that to consider on what element you'll show it, eg. if it's `image/png` then you can put that `uri` into an `img` tag like `<image src={token.uri} alt={"token #" + token.id} />`.
6. How to know on what collection page to put it? Get the `collection.inscriptionId`, fetch that inscription through some Ordinals content API, parse the collection manifest JSON content and get the collection data like `name`, `symbol`, `maxSupply` and etc.

## ORD721 Royalty

The royalty extension is easy. The following could apply to both `ORD721` and `ORD721A`. It probably don't even need to have any link to what collection and tokens it applies to, it's just a source of truth which usually will be fetched if there's some collection that points to that inscription id.

```json
{
  "protocol": {
    "name": "ORD721",
    "version": "1.0",
    "type": "royalty"
  },
  "royalty": {
    "address": "bc1p_royalty_addr", // could be the `creatorAddress` too
    "amount": 6.9,
    "type": "percent" // 'percent' or 'sats', or maybe it could be a token?
  }
  // eventually we probably need a link
  // to the collection manifest hash?
  // "collection": "hash to collection to which this applies to?"
}
```

Maybe we can consider replacing `type` with `token` similar to what happens in `mintPrice`, so that if it's not `'percent'` or `'sats'` then it is considered a link to inscription id of a `deploy` inscription of BRC-20 token (eg. its "address", its inception)

## ORD721 Traits

Cuz why not? Maybe we need it, maybe we don't.
But basically, if a `type: token` manifest's `token.traits` is a string, it will probably mean that it's a link to `ORD721 Traits` inscription id.

Same stuff and considerations apply as with the `Royalty` one - we probably won't need to have a link back to the `collection` manifest.

```json
{
  "protocol": {
    "name": "ORD721",
    "version": "1.0",
    "type": "traits"
  },
  "traits": {
    "body": "green",
    "eyes": 3,
    "toy": "milk"
  }
  // eventually we probably need a link
  // to the collection manifest hash?
  // "collection": "hash to collection to which this applies to?"
}
```

Maybe it could be useful if the actual content is too big and you want to save some space. Or if there are too much traits/attributes, and/or they are too big. Something like that.

## Verification of ORD721(A)Token

Consider you have minted an `ORD721Token` token. At any time you can verify that you've minted/inscribed that token. How?

Easy as 1, 2, 3.

1. Get the whole JSON, remove the `hash` field.
2. Sign that content with your wallet.
3. Merge the content with the signature and hash it through SHA 256.

The resulted hash should be equal to the hash given at the `hash` field.

**\*Merge?** WTF? Add `"signature": "your signature here"` and hash that whole content.

```json
{
  "protocol": {
    "name": "ORD721A",
    "version": "1.0",
    "type": "token"
  },
  "token": {
    "id": 1,
    "traits": {
      "body": "green",
      "eyes": 3,
      "toy": "milk"
    },
    "uri": "data:image/png;base64,4jkh64k5j3h64536="
  },
  "collectionHash": "ff8674d225d9018ccee26068b522f022d188dd71f6ff1658759d0870d8622eD12",
  "collectionInscriptionId": "d0162e09766a998cd6ea192f66411befcd7ec3383111bbb42e20ca29899a3972i0",

  "signature": "my signature"
}
```

## Verify of ORD721Collection

Verification of a collection is almost the same thing.

The process should be the following:

1. Get the JSON, remove `creatorSignature` and sign the whole thing.
2. Validate both are equal.
3. If they are not - fail
4. if they are, put it again on `creatorSignature`
5. Then hash the whole thing and compare that with `collectionHash` too.
