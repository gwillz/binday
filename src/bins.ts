
import { GeoJsonObject, FeatureCollection, MultiPolygon, Polygon, Geometry } from 'geojson';
import { add, getWeek } from 'date-fns';
import { point } from '@turf/helpers';
import pointsWithinPolygon from '@turf/points-within-polygon';

export const DAYS = [
    'sunday',
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
] as const;


export interface MapConfig {
    patterns: Record<string, string[]>;
    map: FeatureCollection;
}


export interface LatLng {
    latitude: number;
    longitude: number;
}


export type WeekDays = typeof DAYS[number];


export type MapBins = {
    [key in WeekDays]?: string[];
}

type Props = {
    config: MapConfig;
    coords: LatLng;
    date: Date;
}

export function getBinWeek(props: Props): MapBins {
    const { config, coords, date } = props;

    // // test data.
    // return {
    //     wednesday: ['red', 'green'],
    //     monday: ['blue'],
    // }

    const weeks = getWeek(date);

    // Can't do anything here.
    if (!isFeatureCollection(config.map)) {
        console.warn('Not a feature collection:', config.map);
        return {};
    }

    const position = point([coords.longitude, coords.latitude]);

    const polygon = config.map.features.find(feature => (
        isPolygonType(feature.geometry) &&
        pointsWithinPolygon(position, feature.geometry).features.length > 0
    ));

    // This is ok?
    // Just means the coordinates are out-of-bounds.
    if (!polygon) {
        return {};
    }

    // This means the feature isn't configured with any bin properties.
    // Which is unlikely, renderers tend to use this to store stroke/fill/colour.
    if (!polygon.properties) {
        console.warn('Found a feature but no properties:', polygon);
        return {};
    }

    const bins: MapBins = {};

    for (let [name, day] of Object.entries(polygon.properties)) {
        if (typeof day !== 'string') continue;
        if (!config.patterns[name]) continue;

        const pattern = config.patterns[name];
        const color = pattern[(weeks - 1) % pattern.length];

        day = day.toLowerCase().trim();

        if (!isDay(day)) {
            console.warn('invalid day:', day);
            continue;
        }

        bins[day]
            ? bins[day]!.push(color)
            : bins[day] = [color];
    }

    return bins;
}


export function getBinDay(props: Props): string[] {
    const { date } = props;

    const day = DAYS[date.getDay()];
    const week = getBinWeek(props);

    return week[day] ?? [];
}


/**
 *
 * @param req
 * @param name
 */
export function getEditLink(hostname: string, name: string) {
    return "https://geojson.io" +
        "/#data=data:text/x-url," +
        encodeURIComponent(`https://${hostname}/geo?map=${name}`);
}


export function isMapConfig(test: any): test is MapConfig {
    return test &&
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


export function isDay(day: any): day is WeekDays {
    return (
        !!day
        && typeof day === 'string'
        && DAYS.includes(day as any)
    );
}


export function getCalendar(date: Date) {

    // S M T W T F 1
    // 2 3 4 5 6 7 8
    // 9 0 1 2 3 4 5
    // 6 7 8 9 0 1 2
    // 3 4 5 6 7 8 9
    // 0 1 T W T F S

    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
    const startDay = add(firstDay, { days: -1 * firstDay.getDay() });

    const calendar: Date[][] = [];
    let cursor = new Date(startDay.getTime());
    cursor.setHours(0, 0, 0, 0);

    for (let i = 0; i < 42; i++) {
        let col = i % 7;
        let row = Math.floor(i / 7);

        if (col === 0) {
            calendar[row] = [];
        }

        calendar[row][col] = new Date(cursor.getTime());
        cursor.setDate(cursor.getDate() + 1);
    }

    return calendar;
}
