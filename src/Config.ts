import { CreateUniqHash } from '@ludeschersoftware/utils';
import GlobalConfigInterface from './Interfaces/GlobalConfigInterface';
import { CONFIG_STORE, CONFIG_KEY as CONFIG_KEY_TYPE } from './@types/global';

export const CONFIG_KEY = Symbol(CreateUniqHash(25)) as typeof CONFIG_KEY_TYPE;

export function initializeConfig(): void {
    if ((CONFIG_KEY in globalThis) === false) {
        (globalThis as any)[CONFIG_KEY] = new Map();
    }
}

export function setConfig(key: string, config: GlobalConfigInterface): void {
    if (CONFIG_KEY in globalThis) {
        if (((globalThis as any)[CONFIG_KEY] as CONFIG_STORE).has(key)) {
            throw new Error(`Cannot create config: an entry for ID "${key}" already exists.`);
        } else {
            ((globalThis as any)[CONFIG_KEY] as CONFIG_STORE).set(key, config);
        }
    } else {
        throw new Error('GlobalConfig has not been initialized yet!');
    }
}

export function getConfig(key: string): GlobalConfigInterface {
    if (CONFIG_KEY in globalThis) {
        if (((globalThis as any)[CONFIG_KEY] as CONFIG_STORE).has(key)) {
            return ((globalThis as any)[CONFIG_KEY] as CONFIG_STORE).get(key)!;
        } else {
            throw new Error(`No config found for ID: "${key}"!`);
        }
    } else {
        throw new Error('GlobalConfig has not been initialized yet!');
    }
}

export const configStore = (globalThis as any)[CONFIG_KEY];
