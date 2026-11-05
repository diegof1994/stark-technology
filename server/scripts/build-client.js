/**
 * Compila el frontend cuando el servidor se instala en Render.
 *
 * Render define la variable RENDER=true en sus builds. En ese caso, despues de
 * `npm install` del server, se instala y compila el cliente (client/dist) para
 * que Express sirva la tienda y la API desde una sola URL.
 * En local no hace nada (o forzalo con BUILD_CLIENT=true).
 */
import { execSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const shouldBuild = process.env.RENDER === 'true' || process.env.BUILD_CLIENT === 'true';
if (!shouldBuild) process.exit(0);

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const run = (cmd) => execSync(cmd, { cwd: root, stdio: 'inherit' });

console.log('\n> Compilando el frontend (client/dist)...');
run('npm install --prefix client --include=dev');
run('npm run build --prefix client');
console.log('> Frontend listo.\n');
