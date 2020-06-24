
import { Context, createElement } from '@bikeshaving/crank';
import { MapConfig, getBinWeek, getBinDay } from '../common/utils';
import { Widget } from '../common/Widget';
import { getGeo } from './dom';


export async function* App(this: Context, props: MapConfig) {
    let bin_week = getBinWeek(props.bin_pattern);
    let bin_day = "...";
    
    for await (props of this) {
        try {
            const geo = await getGeo({ enableHighAccuracy: true });
            bin_day = getBinDay(props.map, geo) ?? "unavailable";
        }
        catch (error) {
            console.error(error);
        }
        
        yield <Widget {...{bin_week, bin_day}} />
    }
}
