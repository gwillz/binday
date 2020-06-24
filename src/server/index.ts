
import express, { Response, Request, NextFunction } from 'express';
import morgan from 'morgan';
import compression from 'compression';
import cors from 'cors';
import { HttpError } from './HttpError';
import { r } from './utils';

import { HtmlController } from './HtmlController';
import { JsController } from './JsController';
import { ApiController } from './ApiController';
import { WidgetController } from './WidgetController';


const PORT = +process.env.PORT! || 3000;


function main() {
    const app = express();
    
    app.use(morgan('combined'));
    app.use(compression());
    app.use(cors());
    app.use('/', HtmlController());
    app.use('/widget', WidgetController());
    app.use('/api', ApiController());
    app.use('/js', JsController());
    app.use('/examples', express.static(r('examples')));
    app.use(errorHandler);

    // Start.
    app.listen(PORT, () => {
        console.log('Listening on:', PORT);
    });
}


function errorHandler(error: any, req: Request, res: Response, next: NextFunction) {
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
}


if (require.main === module) {
    require('source-map-support').install();
    main();
}