
import fs from 'fs';
import util from 'util';
import path from 'path';
import { Request, Response, NextFunction } from 'express';
import { HttpError } from './HttpError';
import { GEOJSON_IO_URL } from '../common/config';
import { isMapConfig } from '../common/bins';


export const readFileAsync = util.promisify(fs.readFile);
export const readdirAsync = util.promisify(fs.readdir);

export const ROOT = path.resolve(process.env.PWD || '.');
export const r = path.resolve.bind(null, ROOT);

/**
 * 
 * @param test 
 * @param status 
 * @param message 
 */
export function assert<T>(test: T, status = 400, message = "Assertion error"): asserts test is NonNullable<T> {
    if (!test) throw new HttpError(status, message);
}


/**
 * 
 * @param name 
 */
export async function loadConfig(name: string) {
    try {
        const file = await readFileAsync(r('maps', name + '.json'), 'utf-8');
        const config = JSON.parse(file);
        config.target = "";
        
        if (isMapConfig(config)) return config;
    }
    catch (error) {}
    
    throw new HttpError(400, `Invalid or missing map file for '${name}'`);
}


/**
 * 
 * @param req 
 * @param name 
 */
export function getEditLink(req: Request, name: string) {
    return GEOJSON_IO_URL +
        "/#data=data:text/x-url," +
        encodeURIComponent(`${req.protocol}://${req.hostname}/geo?map=${name}`);
}


/**
 * Handle async functions properly.
 * @param cb
 */
export function a(cb: (req: Request, res: Response, next?: NextFunction) => Promise<void>) {
    return (req: Request, res: Response, next: NextFunction) => {
        cb(req, res, next).catch(next);
    }
}
