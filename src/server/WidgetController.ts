
import { Router } from 'express';
import { createElement } from '@bikeshaving/crank/cjs';
import { renderer } from '@bikeshaving/crank/cjs/html';
import { a, assert, loadConfig } from './utils';
import { CONTENT_TYPE_HTML } from '../common/config';
import { getBinDay, getBinWeek, getEditLink } from '../common/bins';
import { Widget } from '../common/Widget';


export function WidgetController() {
    const router = Router();
    
    router.get('/', a(async (req, res) => {
        assert(req.query.map, 400, "Missing 'map' parameter.");
        assert(req.query.lat, 400, "Missing 'lat' parameter.");
        assert(req.query.lng, 400, "Missing 'lng' parameter.");
        
        
        const config = await loadConfig(req.query.map as string);
        config.edit_link = getEditLink(req.hostname, req.query.map as string);
        
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
    
    return router;
}
