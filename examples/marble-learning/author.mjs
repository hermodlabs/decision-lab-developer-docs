import { author } from '../author.mjs';

const { destination } = await author('marble-learning');
console.log(`Wrote template, app, and default case to ${destination.pathname}`);
