
import { renderer } from '@bikeshaving/crank/dom';
import { createElement } from '@bikeshaving/crank';
import { isMapConfig } from '../common/utils';
import { ready } from './dom';
import { App } from './App';


declare global {
    interface Window {
        __config?: unknown;
    }
}

console.log("Loaded.");

ready(() => {
    console.log("Ready.");

    if (!isMapConfig(window.__config)) {
        console.error("Invalid/Missing __config.");
        return;
    }

    const config = window.__config;
    const element = document.getElementById(config.target);

    if (!element) {
        console.error("Cannot find element: " + config.target);
        return;
    }

    console.log("Render.");
    renderer.render(<App {...config} />, element);
});
