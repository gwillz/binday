
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
