
import { createElement } from '@b9g/crank';
import style from './widget.module.css';
import { MapBins, DAYS, LatLng, MapConfig, getBinDay } from './bins';
import { Calendar } from './Calendar';


type Props = {
    config?: MapConfig;
    coordinates?: LatLng;
}

export function Widget(props: Props) {
    const today = new Date();

    const getColors = (date: Date) => {
        if (!props.coordinates) return [];
        if (!props.config) return [];

        return getBinDay({
            config: props.config,
            coords: props.coordinates,
            date: date,
        });
    }

    return (
        <div class={style.widget}>
            <Calendar today={today}>
                {date => (
                    <div class={style.day}>
                        <div class={style.label}>{date.getDate()}</div>
                        <div class={style.icons}>
                            {getColors(date).map(color => (
                                <div
                                    crank-key={color}
                                    class={style.icon}
                                    style={{ 'background-color': color }}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </Calendar>
            <div class={style.status}>
                {
                    !props.coordinates ? (
                        <p>Acquiring location...</p>
                    ) : !props.config ? (
                        <p>Sorry, no bin data for your location.</p>
                    ) : null
                }
            </div>
        </div>
    )
}
