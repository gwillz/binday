
import { Context, createElement } from '@b9g/crank';
import style from './widget.module.css';
import { LatLng, BinConfig, Bins } from './bins';
import { Calendar } from './Calendar';
import { isTomorrow } from 'date-fns';


type Props = {
    config?: BinConfig;
    coordinates?: LatLng;
}

export function *Widget(this: Context<Props>, props: Props) {

    let bins: Bins | null = null;

    for (let props of this) {

        if (!bins && props.config && props.coordinates) {
            bins = new Bins(props.config, props.coordinates);
        }
        else if (bins && props.coordinates) {
            bins.updateCoordinates(props.coordinates);
        }
        else if (!props.config || !props.coordinates) {
            bins = null;
        }

        const today = new Date();
        const nextDate = bins?.getNextDate(today);

        yield (
            <div class={style.widget}>
                <Calendar today={today}>
                    {date => (
                        <div class={style.day}>
                            <div class={style.label}>{date.getDate()}</div>
                            <div class={style.icons}>
                                {bins?.getColors(date).map(color => (
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
                        !props.config ? (
                            <p>Sorry, no bin data for your location.</p>
                        ) : !props.coordinates ? (
                            <p>Acquiring location...</p>
                        ) : nextDate === today ? (
                            <p>It's today!!</p>
                        ) : nextDate && isTomorrow(nextDate) ? (
                            <p>It's tomorrow.</p>
                        ) : (
                            null
                        )
                    }
                </div>
            </div>
        )
    }
}
