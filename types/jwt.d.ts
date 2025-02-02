/**
 * Signs a payload creating a JWT.
 * @param {Object} payload - The payload to sign.
 * @param {Object} [options={}] - Options for the JWT.
 * @param {boolean} [options.useData=true] - Wrap payload in a data object.
 * @param {boolean|number} [options.nbf] - Not before claim.
 * @param {boolean|number|string} [options.jti] - JWT ID claim.
 * @param {Object} [options.header={alg: TADASHI_ALG, typ: 'JWT'}] - JWT header.
 * @param {string|KeyObject} [secret=TADASHI_SECRET_KEY_JWT] - Secret key for signing.
 * @returns {Promise<string>} - The signed JWT.
 */
export function sign(payload: any, options?: {
    useData?: boolean;
    nbf?: boolean | number;
    jti?: boolean | number | string;
    header?: any;
}, secret?: string | KeyObject): Promise<string>;
/**
 * Verifies a JWT.
 * @param {string} jwt - The JWT to verify.
 * @param {Object} [options={}] - Verification options.
 * @param {string|KeyObject} [secret=TADASHI_SECRET_KEY_JWT] - Secret key for verification.
 * @returns {Promise<Object>} - The decoded and verified JWT payload.
 */
export function _verify(jwt: string, options?: any, secret?: string | KeyObject): Promise<any>;
/**
 * Asynchronously verifies a JWT and logs errors if verification fails.
 * @param {string} jwt - The JWT to verify.
 * @param {Object} [options={}] - Verification options.
 * @param {string|KeyObject} [secret=TADASHI_SECRET_KEY_JWT] - Secret key for verification.
 * @returns {Promise<Object|undefined>} - The decoded and verified JWT payload, or undefined if verification fails.
 */
export function verify(jwt: string, options?: any, secret?: string | KeyObject): Promise<any | undefined>;
/**
 * Parses a JWT and extracts the payload.
 * @param {string} jwt - The JWT to parse.
 * @returns {Object|undefined} - The decoded payload, or undefined if parsing fails.
 */
export function parse(jwt: string): any | undefined;
import { KeyObject } from 'node:crypto';
