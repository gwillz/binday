
import { Context, createElement } from '@bikeshaving/crank';
import { MapConfig, getBins } from '../common/bins';
import { Widget } from '../common/Widget';
import { getGeo } from './dom';


export async function* App(this: Context, props: MapConfig) {
    let bins: Record<string, string[]> = {};
    
    yield <Widget bins={bins} />
    
    for await (props of this) {
        try {
            const geo = await getGeo({ enableHighAccuracy: true });
            bins = getBins(props, geo);
        }
        catch (error) {
            console.error(error);
        }
        
        yield <Widget bins={bins} />
    }
}
