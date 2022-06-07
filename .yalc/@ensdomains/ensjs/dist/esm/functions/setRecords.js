import { ethers } from 'ethers';
import { generateRecordCallArray } from '../utils/recordHelpers';
export default async function ({ contracts, provider, getResolver, }, name, records) {
    if (!name.includes('.')) {
        throw new Error('Input is not an ENS name');
    }
    const resolverAddress = await getResolver(name);
    if (!resolverAddress) {
        throw new Error('No resolver found for input address');
    }
    const address = await provider?.getSigner().getAddress();
    if (!address) {
        throw new Error('No signer found');
    }
    const resolver = (await contracts?.getPublicResolver(provider, resolverAddress))?.connect(provider?.getSigner());
    const namehash = ethers.utils.namehash(name);
    const calls = generateRecordCallArray(namehash, records, resolver);
    return resolver?.multicall(calls);
}
