
import { GeoJsonObject, FeatureCollection } from 'geojson';
import { DateTime } from 'luxon';
import * as turf from '@turf/turf';

import config from './config.json';
import map from './map.geojson';

// @ts-ignore
console.log(map.features)

export async function main() {
    
    const geo = await getGeo();
    
    console.log(geo)
    
    const polygon = (() => {
        if (!geo) return null;
        if (!isFeatureCollection(map)) return null;
        
        const point = turf.point([geo.longitude, geo.latitude]);
        
        return map.features.find(feature => (
            console.log(point, feature.geometry.type),
            turf.pointsWithinPolygon(point, feature.geometry as any)
        ));
    })();
    
    console.log(polygon?.properties?.weekday)
    console.log(yellowOrGreen(config.bin_pattern));
}

function isFeatureCollection(test: GeoJsonObject): test is FeatureCollection {
    return test.type === "FeatureCollection";
}

function yellowOrGreen(bin_pattern: string[]): string {
    const now = DateTime.local();
    return bin_pattern[(now.weekNumber - 1) % bin_pattern.length];
}

async function getGeo(options?: PositionOptions) {
    return new Promise<Coordinates>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(geo => resolve(geo.coords), reject, options);
    });
}

main();
