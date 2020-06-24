
import path from 'path';
import fs from 'fs';
import util from 'util';
import express, { Response, Request, NextFunction } from 'express';
import morgan from 'morgan';
import { renderer } from '@bikeshaving/crank/cjs/html';
import { createElement } from '@bikeshaving/crank/cjs';

import { HttpError } from './HttpError';
import { isMapConfig, getBinDay, getBinWeek } from '../common/utils';
import { Widget } from '../common/Widget';


const readFileAsync = util.promisify(fs.readFile);
const r = path.resolve.bind(null, __dirname);


const PORT = +process.env.PORT! || 3000;
const ROOT = r('..');


function main() {
    const app = express();

    // Logging.
    app.use(morgan('combined'));

    // Serve widget code + inject config.
    app.get('/js/widget.js', a(async (req, res) => {
        assert(req.query.target, 400, "Missing 'target' parameter.");
        assert(req.query.map, 400, "Missing 'map' parameter.");
        
        const config = await loadConfig(req.query.map as string);
        config.target = req.query.target as string;
        
        let payload = "";
        payload += ';window.__config=' + JSON.stringify(config) + ';';
        payload += await readFileAsync(r(ROOT, 'public/widget.js'), 'utf-8');

        res.header('content-type', 'application/javascript;charset=utf-8');
        res.send(payload);
    }));
    
    
    app.get('/js/lib.js', a(async (req, res) => {
        assert(req.query.map, 400, "Missing 'map' parameter.");
        const config = await loadConfig(req.query.map as string);
        
        let payload = "";
        payload += ';window.__config=' + JSON.stringify(config) + ';';
        payload += await readFileAsync(r(ROOT, 'public/lib.js'), 'utf-8');

        res.header('content-type', 'application/javascript;charset=utf-8');
        res.send(payload);
    }));
    
    
    app.get('/api', a(async (req, res) => {
        assert(req.query.map, 400, "Missing 'map' parameter.");
        assert(req.query.lat, 400, "Missing 'lat' parameter.");
        assert(req.query.lng, 400, "Missing 'lng' parameter.");
        
        const config = await loadConfig(req.query.map as string);
        
        const coords = {
            latitude: +req.query.lat,
            longitude: +req.query.lng,
        }
        
        res.send({
            bin_day: getBinDay(config.map, coords),
            bin_week: getBinWeek(config.bin_pattern),
        });
    }));
    
    app.get('/widget', a(async (req, res) => {
        assert(req.query.map, 400, "Missing 'map' parameter.");
        assert(req.query.lat, 400, "Missing 'lat' parameter.");
        assert(req.query.lng, 400, "Missing 'lng' parameter.");
        
        
        const config = await loadConfig(req.query.map as string);
        
        const coords = {
            latitude: +req.query.lat,
            longitude: +req.query.lng,
        }
        
        const bin_day = getBinDay(config.map, coords) ?? "unavailable";
        const bin_week = getBinWeek(config.bin_pattern);
        
        const body = await renderer.render(createElement(Widget, {
            bin_day,
            bin_week,
        }));
        
        res.header('content-type', 'text/html;charset=utf-8');
        res.send(body);
    }));
    
    app.use('/examples', express.static(r(ROOT, 'examples')));
    // app.get('/', (req, res) => res.sendFile(r(ROOT, 'README.md')));
    
    // Error handling.
    app.use((error: any, req: Request, res: Response, next: NextFunction) => {
        if (HttpError.isHttpError(error)) {
            console.log(error.message);
            res.status(error.status);
            res.send(error.message);
        }
        else {
            console.error(error);
            res.status(500);
            res.send("internal error");
        }
    });

    // Start.
    app.listen(PORT, () => {
        console.log('Listening on:', PORT);
    });
}


function assert<T>(test: T, status = 400, message = "Assertion error"): asserts test is NonNullable<T> {
    if (!test) throw new HttpError(status, message);
}


async function loadConfig(name: string) {
    try {
        const file = await readFileAsync(r(ROOT, 'maps', name + '.json'), 'utf-8');
        const config = JSON.parse(file);
        config.target = "";
        
        if (isMapConfig(config)) return config;
    }
    catch (error) {}
    
    throw new HttpError(400, `Invalid or missing map file for '${name}'`);
}


/**
 * Handle async functions properly.
 * @param cb
 */
function a(cb: (req: Request, res: Response, next?: NextFunction) => Promise<void>) {
    return (req: Request, res: Response, next: NextFunction) => {
        cb(req, res, next).catch(next);
    }
}


if (require.main === module) {
    require('source-map-support').install();
    main();
}