import FlakeId from 'flake-idgen';
import baseX from 'base-x';

const bs64 = baseX('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/');
const flake = new FlakeId();

/**
 * Generates a unique ID using FlakeId and encodes it in base64.
 *
 * Is used for generating unique identifiers for
 * tracing requests, like span IDs and trace IDs.
 *
 * @returns {string} - The base64-encoded unique ID.
 */
export const generateId = (): string => bs64.encode(flake.next() as unknown as Uint8Array);
