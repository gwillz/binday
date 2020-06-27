
import { getBins as _getBins, isMapConfig, LatLng } from '../common/bins';


declare global {
    interface Window {
        __config?: unknown;
        Binday: {
            getBins: typeof getBins;
        }
    }
}


function getBins(coords: LatLng): Record<string, string[]> | undefined {
    if (!isMapConfig(window.__config)) {
        console.error("Binday: config not loaded.");
        return undefined;
    }
    
    return _getBins(window.__config, coords);
}


window.Binday = {
    getBins,
}
