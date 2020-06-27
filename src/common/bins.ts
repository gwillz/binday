
import { GeoJsonObject, FeatureCollection, MultiPolygon, Polygon, Geometry } from 'geojson';
import { getWeek } from 'date-fns';
import { point } from '@turf/helpers';
import pointsWithinPolygon from '@turf/points-within-polygon';
import { GEOJSON_IO_URL } from './config';


export interface MapConfig {
    target: string;
    edit_link?: string;
    patterns: Record<string, string[]>;
    map: FeatureCollection;
}


export interface LatLng {
    latitude: number;
    longitude: number;
}

export function getBins(config: MapConfig, coords: LatLng): Record<string, string[]> {
    const weeks = getWeek(new Date());
    
    if (!isFeatureCollection(config.map)) return {};
    
    const position = point([coords.longitude, coords.latitude]);
    
    const polygon = config.map.features.find(feature => (
        isPolygonType(feature.geometry) &&
        pointsWithinPolygon(position, feature.geometry).features.length > 0
    ));

    if (!polygon?.properties) return {};
    
    const bins: Record<string, string[]> = {};
    
    for (let [name, day] of Object.entries(polygon.properties)) {
        if (typeof day !== 'string') continue;
        if (!config.patterns[name]) continue;
        
        const pattern = config.patterns[name];
        const color = pattern[(weeks - 1) % pattern.length];
        
        bins[day]
            ? bins[day].push(color)
            : bins[day] = [color];
    }
    
    return bins;
}


/**
 * 
 * @param req 
 * @param name 
 */
export function getEditLink(hostname: string, name: string) {
    return GEOJSON_IO_URL +
        "/#data=data:text/x-url," +
        encodeURIComponent(`https://${hostname}/geo?map=${name}`);
}


export function isMapConfig(test: any): test is MapConfig {
    return test &&
        typeof test.target === "string" &&
        !!test.patterns &&
        isFeatureCollection(test.map);
}


export function isFeatureCollection(test?: GeoJsonObject | null): test is FeatureCollection {
    return !!test && test.type === "FeatureCollection";
}


export function isPolygonType(test?: Geometry | null): test is Polygon | MultiPolygon {
    return !!test && (
        test.type === "Polygon" ||
        test.type === "MultiPolygon"
    );
}
