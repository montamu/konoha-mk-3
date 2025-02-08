import * as handlers from './handlers';
import { factory } from './init.js';

export default factory.discord().loader(Object.values(handlers));