
import { GeoJsonObject, FeatureCollection, MultiPolygon, Polygon, Geometry } from 'geojson';
import { getWeek } from 'date-fns';
import { point } from '@turf/helpers';
import pointsWithinPolygon from '@turf/points-within-polygon';


export interface MapConfig {
    target: string;
    bin_pattern: string[];
    map: FeatureCollection;
}


export interface LatLng {
    latitude: number;
    longitude: number;
}


export function getBinWeek(bin_pattern: string[]): string {
    const weeks = getWeek(new Date());
    return bin_pattern[(weeks - 1) % bin_pattern.length];
}


export function getBinDay(map: FeatureCollection, coords: LatLng): string | undefined {
    const position = point([coords.longitude, coords.latitude]);

    if (isFeatureCollection(map)) {
        const polygon = map.features.find(feature => (
            isPolygonType(feature.geometry) &&
            pointsWithinPolygon(position, feature.geometry)
        ));

        return polygon?.properties?.weekday as string;
    }

    return undefined;
}


export async function sleep(timeout: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, timeout));
}


export function isMapConfig(test: any): test is MapConfig {
    return test &&
        typeof test.target === "string" &&
        test.bin_pattern instanceof Array &&
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


export function ready(cb: () => void) {
    if (document.readyState === "complete") {
        cb();
    }
    else {
        window.addEventListener('load', inner);
        document.addEventListener('DOMContentLoaded', inner);
    }

    function inner() {
        window.removeEventListener('load', inner);
        document.removeEventListener('DOMContentLoaded', inner);
        cb();
    }
}


export async function getGeo(options?: PositionOptions) {
    return new Promise<Coordinates>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(geo => resolve(geo.coords), reject, options);
    });
}
