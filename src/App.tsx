
import { Context, createElement } from '@b9g/crank';
import { MapBins, MapConfig, getBins, isMapConfig } from './bins';
import { Widget } from './Widget';
import { getGeo } from './dom';

type Props = {
    url: string;
}

export async function* App(this: Context<Props>, props: Props) {
    let config: MapConfig | null = null;
    let bins: MapBins = {};
    let geo: GeolocationCoordinates | undefined = undefined;

    for await (props of this) {
        yield <Widget bins={bins} />

        const res = await fetch(props.url, { mode: 'cors' });

        config = await res.json();

        if (!isMapConfig(config)) {
            console.warn('invalid map config:', props.url);
            config = null;
        }

        try {
            geo = await getGeo({ enableHighAccuracy: true, cache: 300 });
        }
        catch (error) {
            console.error(error);
        }

        if (config && geo) {
            bins = getBins(config, geo);
        }

        yield <Widget bins={bins} coordinates={geo} />
    }
}
