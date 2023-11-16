
import { Context, createElement } from '@b9g/crank';
import { BinWeek, BinConfig, getBinWeek, isMapConfig } from './bins';
import { Widget } from './Widget';
import { getGeo } from './dom';

type Props = {
    url: string;
}

export async function* App(this: Context<Props>, props: Props) {
    let config: BinConfig | undefined = undefined;
    let geo: GeolocationCoordinates | undefined = undefined;

    for await (props of this) {
        yield <Widget config={config} />

        const res = await fetch(props.url, { mode: 'cors' });

        config = await res.json();

        if (!isMapConfig(config)) {
            console.warn('invalid map config:', props.url);
            config = undefined;
        }

        try {
            geo = await getGeo({ enableHighAccuracy: true, cache: 300 });
        }
        catch (error) {
            console.error(error);
        }

        yield <Widget config={config} coordinates={geo} />
    }
}
