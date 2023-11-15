
import { renderer } from '@b9g/crank/dom';
import { createElement } from '@b9g/crank';
import { ready } from './dom';
import { App } from './App';


declare global {
    interface Window {
        __binday__: {
            render: () => void;
        }
    }
}


async function renderAll() {
    const elements = document.querySelectorAll<HTMLElement>('[data-binday]');

    for (let element of elements) {
        if (element.dataset.binday === 'true') {
            continue;
        }

        renderOne(element);
        element.dataset.binday = 'true';
    }
}


async function renderOne(element: HTMLElement) {
    const url = element.getAttribute('data-binday');

    try {
        if (!url) {
            throw new Error('missing binday URL');
        }

        renderer.render(<App url={url} />, element);
    }
    catch (error) {
        console.error(error);
    }
}


Object.defineProperty(window, '__binday__', {
    writable: false,
    value: Object.freeze({
        render: renderAll,
    }),
})

ready(renderAll);

