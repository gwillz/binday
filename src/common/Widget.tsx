
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

// function s(names: Record<string, any>) {
//     return Object.entries(names)
//         .map(([name, test]) => test ? name : '')
//         .join(' ')
// }

function s(...names: string[]) {
    return names.join(' ');
}

type WidgetProps = {
    bins: Record<string, string[] | undefined>;
}

export function Widget(props: WidgetProps) {
    return (
        <div class={style.widget}>
            <style>{css}</style>
            {DAYS.map(day => (
                <Day
                    crank-key={day}
                    title={day}
                    colors={props.bins[day]}
                />
            ))}
        </div>
    )
}

interface DayStat {
    name: string; // trash, recycling
    colors: string[]; // red, yellow, green
    day: string; // monday, tuesday, wednesday
}

type DayProps = {
    title: string;
    colors?: string[];
}

function Day(props: DayProps) {
    return (
        <div class={style.day}>
            <span class={style.label}>
                {props.title.slice(0, 2)}
            </span>
            {props.colors?.map(color => (
                <div class={s(style.icon, color)}>
                    <Raw value={bin} />
                </div>
            ))}
        </div>
    )
}
