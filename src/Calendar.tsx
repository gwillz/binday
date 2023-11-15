
import { Child, createElement, Raw } from '@b9g/crank';
import style from './calendar.module.css';
import { isBefore, isSameMonth, isToday, isWeekend } from 'date-fns';
import { DAYS, getCalendar } from './bins';


function getDayClass(date: Date) {
    const now = new Date().setHours(0, 0, 0, 0);

    const classes: Record<string, boolean> = {
        'off': !isSameMonth(date, now),
        'weekend': isWeekend(date),
        'today': isToday(date),
        'time-travel': isBefore(date, now),
    };

    return Object.entries(classes)
        .reduce((acc, [key, value]) => value ? `${acc} ${style[key]}` : acc, '');
}


type Props = {
    today: Date;
    children?: (date: Date) => Child;
}

export function Calendar(props: Props) {
    const month = props.today.toLocaleString('en', { month: 'long' });

    return (
        <table class={style.calendar}>
            <thead>
                <tr>
                    <th colspan={DAYS.length}>{month}</th>
                </tr>
                <tr>
                    {DAYS.map(day => (
                        <th>{day.slice(0, 2)}</th>
                    ))}
                </tr>
            </thead>
            <tbody>
                {getCalendar(props.today).map((week, index) => (
                    <tr crank-key={index}>
                        {week.map((date, index) => (
                            <td
                                class={getDayClass(date)}
                                crank-key={index}
                            >
                                {props.children ? props.children(date) : date.getDate()}
                            </td>
                        ))}
                    </tr>
                ))}
            </tbody>
        </table>
    )
}
