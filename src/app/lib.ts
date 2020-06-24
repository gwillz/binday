
import { getBinDay, getBinWeek, isMapConfig, LatLng } from '../common/bins';


declare global {
    interface Window {
        __config?: unknown;
        Binday: {
            getDay: typeof getDay;
            getWeek: typeof getWeek;
        }
    }
}


function getWeek(): string | undefined {
    if (!isMapConfig(window.__config)) {
        console.error("Binday: config not loaded.");
        return undefined;
    }
    return getBinWeek(window.__config.bin_pattern);
}


function getDay(coords: LatLng): string | undefined {
    if (!isMapConfig(window.__config)) {
        console.error("Binday: config not loaded.");
        return undefined;
    }
    return getBinDay(window.__config.map, coords);
}


window.Binday = {
    getDay,
    getWeek,
}
