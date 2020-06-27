
import { createElement, Raw } from '@bikeshaving/crank';
import bin from './bin.svg';
import style, {css} from './widget.css';

const DAYS = [
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
    'sunday',
];

function s(names: Record<string, any>) {
    return Object.entries(names)
        .map(([name, test]) => test ? name : '')
        .join(' ')
}

type Props = {
    bin_week: string;
    bin_day: string;
}

export function Widget(props: Props) {
    return (
        <div class={style.widget}>
            <style>{css}</style>
            {DAYS.map(day => (
                <div crank-key={day}
                    class={s({
                        [style.day]: true,
                        [props.bin_week]: day === props.bin_day,
                    })}>
                    <span class={style.label}>{day.slice(0, 2)}</span>
                    {day === props.bin_day && (
                        <div class={style.icon}>
                            <Raw value={bin} />
                        </div>
                    )}
                </div>
            ))}
        </div>
    )
}
