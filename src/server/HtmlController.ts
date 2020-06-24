
import { Router } from 'express';
import MarkdownIt from 'markdown-it';
import { CONTENT_TYPE_HTML } from '../common/config';
import { a, r, readFileAsync } from './utils';


export function HtmlController() {
    const router = Router();
    const md = new MarkdownIt();
    
    router.get('/', a(async (req, res) => {
        const [markdown, index] = await Promise.all([
            readFileAsync(r('README.md'), 'utf-8'),
            readFileAsync(r('src/index.hbs'), 'utf-8'),
        ]);
        
        const content = md.render(markdown);
        const data: Record<string, any> = { content };
        const body = index.replace(/\{\{\{(\w+)\}\}\}/g, (m, name) => data[name]);
        
        res.header('content-type', CONTENT_TYPE_HTML);
        res.send(body);
    }));
    
    return router;
}
