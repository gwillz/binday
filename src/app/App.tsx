
import { Context, createElement } from '@bikeshaving/crank';
import { FeatureCollection } from 'geojson';
import { MapConfig, getBinWeek, getBinDay, getGeo } from './utils';


export function* App(props: MapConfig) {
    while (true) {
        yield (
            <div>
                <WeekDisplay bin_pattern={props.bin_pattern} />
                <DayDisplay map={props.map} />
            </div>
        )
    }
}


async function* DayDisplay(this: Context, props: {map: FeatureCollection}) {
    for await (props of this) {
        // Placeholder
        yield (
            <div>Your bin day is: ...</div>
        )

        try {
            console.log("fetch GPS");
            const geo = await getGeo({ enableHighAccuracy: true });
            const bin_day = getBinDay(props.map, geo);

            if (!bin_day) {
                console.log("not within the zone");
                yield (
                    <div>Your current location isn't within our zone.</div>
                )
            }
            else {
                console.log(bin_day);
                yield (
                    <div>Your bin day is: {bin_day}.</div>
                )
            }
        }
        catch (error) {
            console.log(error);
            yield (
                <div>error.message || error</div>
            )
        }
    }
}


function WeekDisplay(props: {bin_pattern: string[]}) {
    const bin_week = getBinWeek(props.bin_pattern);

    return (
        <div>This week is: {bin_week}</div>
    )
}
