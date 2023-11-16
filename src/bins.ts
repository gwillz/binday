
import { GeoJsonObject, FeatureCollection, MultiPolygon, Polygon, Geometry, Feature } from 'geojson';
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


export interface BinConfig {
    patterns: Record<string, string[]>;
    map: FeatureCollection;
}


export interface LatLng {
    latitude: number;
    longitude: number;
}


export type WeekDays = typeof DAYS[number];


export type BinWeek = {
    [key in WeekDays]?: string[];
}


export class Bins {

    config: BinConfig;
    coords: LatLng;

    #feature?: Feature<Polygon | MultiPolygon>;

    constructor(config: BinConfig, coords: LatLng) {
        this.config = config;
        this.coords = coords;

        this.#feature = this.#parse();
    }

    #parse() {
        // Can't do anything here.
        if (!isFeatureCollection(this.config.map)) {
            console.warn('Not a feature collection:', this.config.map);
            return undefined;
        }

        const position = point([this.coords.longitude, this.coords.latitude]);

        const polygon = this.config.map.features.find(feature => (
            isPolygonFeature(feature) &&
            pointsWithinPolygon(position, feature).features.length > 0
        ));

        if (!polygon) {
            return undefined;
        }

        if (!polygon.properties) {
            console.warn('Found a feature but no properties');
        }

        return polygon as Feature<Polygon | MultiPolygon>;
    }

    updateCoordinates(coords: LatLng) {
        this.coords = coords;
    }

    getWeek(date: Date): BinWeek {
        const bins: BinWeek = {};

        if (!this.#feature || !this.#feature.properties) {
            return bins;
        }

        const weeks = getWeek(date);

        for (let [name, day] of Object.entries(this.#feature.properties)) {
            if (typeof day !== 'string') continue;
            if (!this.config.patterns[name]) continue;

            const pattern = this.config.patterns[name];
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

    getColors(date: Date): string[] {
        const day = DAYS[date.getDay()];
        const week = this.getWeek(date);

        return week[day] ?? [];
    }

    getNextDate(date: Date): Date | null {
        const week = this.getWeek(date);
        const day = DAYS[date.getDay()];

        if (week[day]) {
            return date;
        }

        for (let i = 1; i < 7; i++) {
            const next = add(date, { days: i });
            const nextDay = DAYS[next.getDay()];

            if (week[nextDay]) {
                return next;
            }
        }

        return null;
    }
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


export function isMapConfig(test: any): test is BinConfig {
    return test &&
        !!test.patterns &&
        isFeatureCollection(test.map);
}


export function isFeatureCollection(test?: GeoJsonObject | null): test is FeatureCollection {
    return !!test && test.type === "FeatureCollection";
}


export function isPolygonType(test: any): test is Polygon | MultiPolygon {
    return !!test && (
        test.type === "Polygon" ||
        test.type === "MultiPolygon"
    );
}


export function isPolygonFeature(test?: any): test is Feature<Polygon | MultiPolygon> {
    return (
        !!test &&
        typeof test === "object" &&
        test.type === "Feature" &&
        isPolygonType(test.geometry)
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
