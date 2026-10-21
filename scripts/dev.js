/**
 * Script de desarrollo: levanta API y frontend en paralelo con un solo comando.
 * Uso: npm run dev  (desde la raiz del proyecto)
 */
import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

/** Procesos hijos para poder cerrarlos juntos. */
const children = [];

/**
 * Inicia un proceso hijo heredando la salida estandar.
 * @param {string} label Nombre mostrado en la consola.
 * @param {string} command Comando a ejecutar.
 * @param {string[]} args Argumentos.
 * @param {string} cwd Directorio de trabajo.
 */
const start = (label, command, args, cwd) => {
  const child = spawn(command, args, {
    cwd,
    shell: true,
    env: { ...process.env, FORCE_COLOR: '1' },
  });

  const prefix = `\x1b[36m[${label}]\x1b[0m`;
  const pipe = (stream, target) => {
    stream.on('data', (chunk) => {
      String(chunk)
        .split('\n')
        .filter((line) => line.trim())
        .forEach((line) => target.write(`${prefix} ${line}\n`));
    });
  };
  pipe(child.stdout, process.stdout);
  pipe(child.stderr, process.stderr);

  child.on('exit', (code) => {
    console.log(`${prefix} proceso terminado (codigo ${code})`);
    shutdown();
  });

  children.push(child);
  return child;
};

/** Cierra todos los procesos hijos. */
const shutdown = () => {
  children.forEach((child) => {
    if (!child.killed) child.kill();
  });
  process.exit(0);
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

console.log('\n  STARK TECHNOLOGY - Entorno de desarrollo');
console.log('  -----------------------------------------');
console.log('  API      -> http://localhost:4000');
console.log('  Frontend -> http://localhost:5173');
console.log('  -----------------------------------------\n');

start('api', 'npm', ['run', 'dev'], path.join(root, 'server'));
start('web', 'npm', ['run', 'dev'], path.join(root, 'client'));
