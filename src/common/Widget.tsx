
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

type WidgetProps = {
    bin_week: string;
    bin_day: string;
}

export function Widget(props: WidgetProps) {
    return (
        <div class={style.widget}>
            <style>{css}</style>
            {DAYS.map(day => (
                <Day crank-key={day}
                    highlight={day === props.bin_day}
                    color={props.bin_week}
                    title={day}
                />
            ))}
        </div>
    )
}

type DayProps = {
    highlight: boolean;
    color: string;
    title: string;
}

function Day(props: DayProps) {
    return (
        <div class={s({
            [style.day]: true,
            [props.color]: props.highlight,
        })}>
            <span class={style.label}>
                {props.title.slice(0, 2)}
            </span>
            {props.highlight && (
                <div class={style.icon}>
                    <Raw value={bin} />
                </div>
            )}
        </div>
    )
}
