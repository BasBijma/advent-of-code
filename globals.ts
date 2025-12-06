import { readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const getInputFile = (url:string) => {
    return readFileSync(path.join(path.dirname(fileURLToPath(url)), 'input.txt'), 'utf-8')
}

export { getInputFile };