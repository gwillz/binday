
import { createElement } from '@bikeshaving/crank';

type Props = {
    bin_week: string;
    bin_day: string;
}

export function Widget(props: Props) {
    return (
        <div>
            <div>This week is: {props.bin_week}</div>
            <div>Your bin day is: {props.bin_day}</div>
        </div>
    )
}
