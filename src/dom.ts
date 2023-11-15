
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


export async function getGeo(options?: PositionOptions & { cache?: number }) {
    try {
        const geo = sessionStorage.getItem('binday:geo');

        if (options?.cache && geo) {
            const coords = JSON.parse(geo);

            if (!coords.latitude || !coords.longitude) {
                throw new Error('cache: invalid coordinate data');
            }

            // 5 minute cache.
            if (coords._timestamp! < Date.now() - 1000 * options.cache) {
                throw new Error('cache: expired');
            }

            return coords as GeolocationCoordinates;
        }
    }
    catch (error: any) {
        console.warn(error.message);
    }

    const coords = await new Promise<GeolocationCoordinates>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(geo => resolve(geo.coords), reject, options);
    });

    sessionStorage.setItem('binday:geo', JSON.stringify({
        _timestamp: Date.now(),
        latitude: coords.latitude,
        longitude: coords.longitude,
        accuracy: coords.accuracy,
        altitude: coords.altitude,
        altitudeAccuracy: coords.altitudeAccuracy,
        heading: coords.heading,
        speed: coords.speed,
    }));

    return coords;
}
