
import path from 'path';
import fs from 'fs';
import util from 'util';
import express, { Response, Request, NextFunction } from 'express';
import morgan from 'morgan';


const readFileAsync = util.promisify(fs.readFile);
const r = path.resolve.bind(null, __dirname);


const PORT = +process.env.PORT! || 3000;
const ROOT = r('..');


class HttpError extends Error {
    status: number;

    constructor(status: number, message: string) {
        super(message);
        this.name = "HttpError";
        this.status = status;
    }

    static isHttpError(test: any): test is HttpError {
        return !!test && test.status && test.status < 500;
    }

    static assertHttpError(test: any): asserts test is HttpError {
        if (!HttpError.isHttpError(test)) throw test;
    }
}


function main() {
    const app = express();

    // Logging.
    app.use(morgan('combined'));

    // Serve widget code + inject config.
    app.get('/binday.js', a(async (req, res) => {
        const { target, map } = req.query;

        if (!target) throw new HttpError(400, "Missing 'target' parameter.");
        if (!map) throw new HttpError(400, "Missing 'map' parameter.");

        let config: any;
        try {
            config = JSON.parse(await readFileAsync(r(ROOT, 'maps', map + '.json'), 'utf-8'));
        }
        catch (error) {
            throw new HttpError(400, `Invalid or missing map file for '${map}'`);
        }

        config.target = target;

        let payload = "";
        payload += ';window.__config=' + JSON.stringify(config) + ';';
        payload += await readFileAsync(r(ROOT, 'public/index.js'), 'utf-8');

        res.header('content-type', 'application/javascript;charset=utf-8');
        res.send(payload);
    }));

    // Serve static files, which is what? test.html?
    // TODO Make this conditional for debug/release.
    app.use(express.static(r(ROOT, 'public')));

    // Error handling.
    app.use((error: any, req: Request, res: Response, next: NextFunction) => {
        if (HttpError.isHttpError(error)) {
            console.log(error.message);
            res.status(error.status);
            res.send(error.message);
        }
        else {
            console.error(error);
            res.status(500);
            res.send("internal error");
        }
    });

    // Start.
    app.listen(PORT, () => {
        console.log('Listening on:', PORT);
        console.log('Public is:', r(ROOT, 'public'))
    });
}

/**
 * Handle async functions properly.
 * @param cb
 */
function a(cb: (req: Request, res: Response, next?: NextFunction) => Promise<void>) {
    return (req: Request, res: Response, next: NextFunction) => {
        cb(req, res, next).catch(next);
    }
}


if (require.main === module) {
    require('source-map-support').install();
    main();
}