
import { Router, Request, Response, NextFunction } from 'express';
import { HttpError } from './HttpError';
import { a, loadConfig, assert, readdirAsync, r, getEditLink } from './utils';
import { CONTENT_TYPE_GEOJSON } from '../common/config';
import { getBinWeek, getBinDay } from '../common/bins';


export function ApiController() {
    const router = Router();
    
    router.get('/bins', a(async (req, res) => {
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
    
    router.get('/maps', a(async (req, res) => {
        const files = await readdirAsync(r('maps'));
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
    
    router.get('/geojson', a(async (req, res) => {
        assert(req.query.map, 400, "Missing 'map' parameter.");
        
        const config = await loadConfig(req.query.map as string);
        
        res.header('content-type', CONTENT_TYPE_GEOJSON);
        res.send(config.map);
    }));
    
    // Error handling.
    router.use(errorHandler);
    
    return router;
}


function errorHandler(error: any, req: Request, res: Response, next: NextFunction) {
    if (HttpError.isHttpError(error)) {
        console.log(error.message);
        res.status(error.status);
        res.send({
            status: error.status,
            message: error.message,
            name: error.name,
        });
    }
    else {
        console.error(error);
        res.status(500);
        res.send({
            status: 500,
            message: "internal error",
            name: "Error",
        });
    }
}
