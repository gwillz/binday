
import { Router } from 'express';
import { CONTENT_TYPE_JS } from '../common/config';
import { getEditLink } from '../common/bins';
import { assert, loadConfig, readFileAsync, r, a } from './utils';

export function JsController() {
    const router = Router();
    
    // Serve widget code + inject config.
    router.get('/widget.js', a(async (req, res) => {
        assert(req.query.target, 400, "Missing 'target' parameter.");
        assert(req.query.map, 400, "Missing 'map' parameter.");
        
        const config = await loadConfig(req.query.map as string);
        config.target = req.query.target as string;
        config.edit_link = getEditLink(req.hostname, req.query.map as string);
        
        let payload = "";
        payload += ';window.__config=' + JSON.stringify(config) + ';';
        payload += await readFileAsync(r('public/widget.js'), 'utf-8');

        res.header('content-type', CONTENT_TYPE_JS);
        res.send(payload);
    }));
    
    
    router.get('/lib.js', a(async (req, res) => {
        assert(req.query.map, 400, "Missing 'map' parameter.");
        const config = await loadConfig(req.query.map as string);
        config.edit_link = getEditLink(req.hostname, req.query.map as string);
        
        let payload = "";
        payload += ';window.__config=' + JSON.stringify(config) + ';';
        payload += await readFileAsync(r('public/lib.js'), 'utf-8');

        res.header('content-type', CONTENT_TYPE_JS);
        res.send(payload);
    }));
    
    return router;
}