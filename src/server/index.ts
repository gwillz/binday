
import path from 'path';
import fs from 'fs';
import util from 'util';
import express, { Response, Request, NextFunction } from 'express';
import morgan from 'morgan';
import { renderer } from '@bikeshaving/crank/cjs/html';
import { createElement } from '@bikeshaving/crank/cjs';
import MarkdownIt from 'markdown-it';

import { HttpError } from './HttpError';
import { isMapConfig, getBinDay, getBinWeek } from '../common/utils';
import { Widget } from '../common/Widget';


const readFileAsync = util.promisify(fs.readFile);
const readdirAsync = util.promisify(fs.readdir);
const r = path.resolve.bind(null, __dirname);


const PORT = +process.env.PORT! || 3000;
const ROOT = r('..');

const GEOJSON_IO_URL = "https://geojson.io";

const CONTENT_TYPE_HTML = 'text/html;charset=utf-8';
const CONTENT_TYPE_JS = 'application/javascript;charset=utf-8';
const CONTENT_TYPE_GEOJSON = 'application/geo+json';


function main() {
    const app = express();
    const md = new MarkdownIt();

    // Logging.
    app.use(morgan('combined'));

    // Serve widget code + inject config.
    app.get('/js/widget.js', a(async (req, res) => {
        assert(req.query.target, 400, "Missing 'target' parameter.");
        assert(req.query.map, 400, "Missing 'map' parameter.");
        
        const config = await loadConfig(req.query.map as string);
        config.target = req.query.target as string;
        config.edit_link = getEditLink(req, req.query.map as string);
        
        let payload = "";
        payload += ';window.__config=' + JSON.stringify(config) + ';';
        payload += await readFileAsync(r(ROOT, 'public/widget.js'), 'utf-8');

        res.header('content-type', CONTENT_TYPE_JS);
        res.send(payload);
    }));
    
    
    app.get('/js/lib.js', a(async (req, res) => {
        assert(req.query.map, 400, "Missing 'map' parameter.");
        const config = await loadConfig(req.query.map as string);
        config.edit_link = getEditLink(req, req.query.map as string);
        
        let payload = "";
        payload += ';window.__config=' + JSON.stringify(config) + ';';
        payload += await readFileAsync(r(ROOT, 'public/lib.js'), 'utf-8');

        res.header('content-type', CONTENT_TYPE_JS);
        res.send(payload);
    }));
    
    
    app.get('/api/', a(async (req, res) => {
        assert(req.query.map, 400, "Missing 'map' parameter.");
        assert(req.query.lat, 400, "Missing 'lat' parameter.");
        assert(req.query.lng, 400, "Missing 'lng' parameter.");
        
        const config = await loadConfig(req.query.map as string);
        config.edit_link = getEditLink(req, req.query.map as string);
        
        const coords = {
            latitude: +req.query.lat,
            longitude: +req.query.lng,
        }
        
        res.send({
            bin_day: getBinDay(config.map, coords),
            bin_week: getBinWeek(config.bin_pattern),
            edit_link: config.edit_link,
        });
    }));
    
    app.get('/widget', a(async (req, res) => {
        assert(req.query.map, 400, "Missing 'map' parameter.");
        assert(req.query.lat, 400, "Missing 'lat' parameter.");
        assert(req.query.lng, 400, "Missing 'lng' parameter.");
        
        
        const config = await loadConfig(req.query.map as string);
        config.edit_link = getEditLink(req, req.query.map as string);
        
        const coords = {
            latitude: +req.query.lat,
            longitude: +req.query.lng,
        }
        
        const bin_day = getBinDay(config.map, coords) ?? "unavailable";
        const bin_week = getBinWeek(config.bin_pattern);
        
        const body = await renderer.render(createElement(Widget, {
            bin_day,
            bin_week,
            // TODO edit_link
        }));
        
        res.header('content-type', CONTENT_TYPE_HTML);
        res.send(body);
    }));
    
    app.get('/configs', a(async (req, res) => {
        const files = await readdirAsync(r(ROOT, 'maps'));
        const maps: any[] = [];
        
        for (let file of files) {
            const match = /^(.+)\.json$/.exec(file);
            if (!match) continue;
            
            const [_, name] = match;
            const link = getEditLink(req, name);
            maps.push({ name, link });
        }
        
        res.send({ maps });
    }));
    
    app.get('/geo', a(async (req, res) => {
        assert(req.query.map, 400, "Missing 'map' parameter.");
        
        const config = await loadConfig(req.query.map as string);
        
        res.header('content-type', CONTENT_TYPE_GEOJSON);
        res.send(config.map);
    }));
    
    app.use('/examples', express.static(r(ROOT, 'examples')));
    
    app.get('/', a(async (req, res) => {
        const [markdown, index] = await Promise.all([
            readFileAsync(r(ROOT, 'README.md'), 'utf-8'),
            readFileAsync(r(ROOT, 'src/index.hbs'), 'utf-8'),
        ]);
        
        const content = md.render(markdown);
        const data: Record<string, any> = { content };
        const body = index.replace(/\{\{\{(\w+)\}\}\}/g, (m, name) => data[name]);
        
        res.header('content-type', CONTENT_TYPE_HTML);
        res.send(body);
    }));
    
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


function getEditLink(req: Request, name: string) {
    return GEOJSON_IO_URL +
        "/#data=data:text/x-url," +
        encodeURIComponent(`${req.protocol}://${req.hostname}/geo?map=${name}`);
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