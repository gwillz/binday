
import { createElement, Raw } from '@b9g/crank';
import style from './widget.module.css';
import { MapBins, DAYS, LatLng } from './bins';
import { Calendar } from './Calendar';


type Props = {
    bins: MapBins;
    coordinates?: LatLng;
}

export function Widget(props: Props) {
    const today = new Date();

    const hasData = Object.values(props.bins).some(bins => bins.length > 0);

    return (
        <div class={style.widget}>
            <Calendar today={today}>
                {date => (
                    <div class={style.day}>
                        <div class={style.label}>{date.getDate()}</div>
                        <div class={style.icons}>
                            {(props.bins[DAYS[date.getDay()]] ?? []).map(color => (
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
                    ) : !hasData ? (
                        <p>Sorry, no bin data for your location.</p>
                    ) : null
                }
            </div>
        </div>
    )
}
