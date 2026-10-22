/**
 * Verificacion visual de la UI con el DevTools Protocol de Chrome (headless).
 *
 * Uso: node scripts/verify-ui.js <url> [rutaSalidaPng]
 * - Levanta Chrome headless con el puerto de depuracion.
 * - Abre la URL, espera el render y extrae texto + clases del DOM.
 * - Guarda una captura PNG a pantalla completa.
 */
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PORT = 9333;
const url = process.argv[2] ?? 'http://localhost:5173/';
const shotPath = process.argv[3] ?? null;
/** Modo especial: 'admin' abre el panel, se autentica y abre el formulario de alta. */
const mode = process.argv[4] ?? null;
/** Tema a verificar: 'dark' (default) o 'light'. */
const theme = process.argv[5] ?? 'dark';

const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'stark-chrome-'));

const chrome = spawn(CHROME, [
  '--headless=new',
  '--disable-gpu',
  '--no-sandbox',
  '--hide-scrollbars',
  '--force-device-scale-factor=1',
  `--remote-debugging-port=${PORT}`,
  `--user-data-dir=${profile}`,
  'about:blank',
]);

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/** Espera a que el endpoint de depuracion responda. */
async function waitForDevTools() {
  for (let i = 0; i < 40; i += 1) {
    try {
      const res = await fetch(`http://127.0.0.1:${PORT}/json/version`);
      if (res.ok) return res.json();
    } catch {
      /* reintento */
    }
    await sleep(250);
  }
  throw new Error('Chrome DevTools no respondio');
}

/** Cliente minimo del DevTools Protocol sobre WebSocket. */
class Cdp {
  constructor(ws) {
    this.ws = ws;
    this.id = 0;
    this.pending = new Map();
    ws.addEventListener('message', (event) => {
      const msg = JSON.parse(event.data);
      if (msg.id && this.pending.has(msg.id)) {
        const { resolve, reject } = this.pending.get(msg.id);
        this.pending.delete(msg.id);
        if (msg.error) reject(new Error(msg.error.message));
        else resolve(msg.result);
      }
    });
  }

  send(method, params = {}) {
    this.id += 1;
    const id = this.id;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }

  /** Evalua una expresion JS en la pagina y devuelve su valor. */
  async eval(expression) {
    const result = await this.send('Runtime.evaluate', {
      expression,
      returnByValue: true,
      awaitPromise: true,
    });
    return result.result?.value;
  }
}

try {
  await waitForDevTools();

  // --- Abrimos una pestana con la URL objetivo ---
  const target = await (
    await fetch(`http://127.0.0.1:${PORT}/json/new?${encodeURIComponent(url)}`, {
      method: 'PUT',
    })
  ).json();

  const ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => {
    ws.addEventListener('open', resolve, { once: true });
    ws.addEventListener('error', reject, { once: true });
  });

  const cdp = new Cdp(ws);
  await cdp.send('Page.enable');
  await cdp.send('Runtime.enable');
  await cdp.send('Emulation.setDeviceMetricsOverride', {
    width: 1440,
    height: 1000,
    deviceScaleFactor: 1,
    mobile: false,
  });

  // --- Esperamos al render de React ---
  await sleep(3500);

  // --- Aplicamos el tema pedido usando el toggle real del navbar: asi se
  //     valida el mecanismo completo (contexto + persistencia + CSS). ---
  let themeToggleResult = null;
  if (theme !== 'dark') {
    themeToggleResult = await cdp.eval(`(() => {
      const btn = Array.from(document.querySelectorAll('button')).find((b) =>
        /activar tema (claro|oscuro)/i.test(b.getAttribute('aria-label') || ''),
      );
      if (!btn) return 'sin-toggle';
      if (!/light/.test(document.documentElement.className)) btn.click();
      return 'ok:' + btn.getAttribute('aria-label');
    })()`);
    await sleep(1500);
  }

  // --- Flujo especial del panel admin: login + formulario de alta ---
  if (mode === 'admin') {
    await cdp.eval(`(() => {
      const input = document.querySelector(
        'input[type="password"], input[type="text"], input:not([type])',
      );
      if (!input) return 'sin-input';
      const setter = Object.getOwnPropertyDescriptor(
        window.HTMLInputElement.prototype, 'value',
      ).set;
      setter.call(input, 'stark-dev-admin');
      input.dispatchEvent(new Event('input', { bubbles: true }));
      return 'ok';
    })()`);
    await sleep(400);
    await cdp.eval(`(() => {
      const form = document.querySelector('form');
      if (form) form.requestSubmit();
      return 'ok';
    })()`);
    await sleep(2500);
    // Abrimos el modal de alta de producto.
    await cdp.eval(`(() => {
      const btn = Array.from(document.querySelectorAll('button')).find((b) =>
        /nuevo|crear producto|agregar producto/i.test(b.innerText),
      );
      if (btn) btn.click();
      return 'ok';
    })()`);
    await sleep(1500);
  }

  const report = await cdp.eval(`(() => {
    const count = (sel) => document.querySelectorAll(sel).length;
    const text = (sel) => Array.from(document.querySelectorAll(sel)).map((n) => n.textContent.trim());
    const admin = {
      flashToggle: count('input[type="checkbox"][class*="accent-flare"]'),
      discountInputs: Array.from(document.querySelectorAll('input[type="number"]'))
        .map((i) => ({ value: i.value, min: i.min, max: i.max })),
      modalLabels: Array.from(document.querySelectorAll('label span, label'))
        .map((n) => n.textContent.trim())
        .filter((t) => /oferta flash|descuento|stock|precio/i.test(t)),
    };
    // Geometria real del tachado diagonal (para verificar que no desborda).
    const box = (el) => {
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return {
        x: Math.round(r.x),
        y: Math.round(r.y),
        w: Math.round(r.width),
        h: Math.round(r.height),
      };
    };
    const struck = document.querySelector('[data-testid="flash-original-price"]');
    const line = struck ? struck.querySelector('[data-testid="strike-line"]') : null;
    const final = document.querySelector('[data-testid="flash-final-price"]');
    const strike = {
      container: box(struck),
      line: box(line),
      lineColor: line ? getComputedStyle(line).backgroundColor : null,
      lineRotate: line ? getComputedStyle(line).rotate : null,
      containerColor: struck ? getComputedStyle(struck).color : null,
      containerWeight: struck ? getComputedStyle(struck).fontWeight : null,
      containerSize: struck ? getComputedStyle(struck).fontSize : null,
      finalSize: final ? getComputedStyle(final).fontSize : null,
      finalColor: final ? getComputedStyle(final).color : null,
      finalWeight: final ? getComputedStyle(final).fontWeight : null,
      finalFamily: final ? getComputedStyle(final).fontFamily : null,
    };
    return {
      title: document.title,
      bodyLength: document.body.innerText.length,
      theme: {
        className: document.documentElement.className,
        stored: (() => { try { return localStorage.getItem('stark_theme'); } catch (e) { return null; } })(),
        canvas: getComputedStyle(document.documentElement).getPropertyValue('--canvas').trim(),
        surface1: getComputedStyle(document.documentElement).getPropertyValue('--surface-1').trim(),
        bodyBg: getComputedStyle(document.body).backgroundColor,
        bodyColor: getComputedStyle(document.body).color,
      },
      fonts: {
        display: getComputedStyle(document.querySelector('h1') || document.body).fontFamily,
        loaded: Array.from(document.fonts).filter((f) => f.status === 'loaded').map((f) => f.family),
        spaceGrotesk: document.fonts.check('16px "Space Grotesk Variable"'),
        inter: document.fonts.check('16px "Inter Variable"'),
        jetbrains: document.fonts.check('16px "JetBrains Mono Variable"'),
      },
      counts: {
        flashBadge: count('[aria-label^="Oferta flash"]'),
        flashFinal: count('[data-testid="flash-final-price"]'),
        flashOriginal: count('[data-testid="flash-original-price"]'),
        flashUrgency: count('[data-testid="flash-urgency"]'),
        flashCountdown: count('[data-testid="flash-countdown"]'),
        diagonalStrike: count('[data-testid="strike-line"]'),
        horizontalStrike: count('.line-through'),
        savingsText: count('.text-savings-ink'),
        redText: count('.text-red-500'),
        unitLabel: count('.font-light'),
        productCards: count('article'),
        eyebrow: count('.eyebrow'),
        surface: count('.surface'),
        btnEmber: count('.btn-ember'),
      },
      finalPrices: text('[data-testid="flash-final-price"]').slice(0, 4),
      originalPrices: text('[data-testid="flash-original-price"]').slice(0, 4),
      urgency: text('[data-testid="flash-urgency"]').slice(0, 2),
      countdown: text('[data-testid="flash-countdown"]').slice(0, 1),
      headings: Array.from(document.querySelectorAll('h2')).map((h) => h.innerText.replace(/\\s+/g, ' ').trim()),
      links: Array.from(document.querySelectorAll('a[href*="flash"]')).map((a) => a.getAttribute('href')),
      strike,
      admin,
    };
  })()`);

  report.themeToggleResult = themeToggleResult;
  console.log(JSON.stringify(report, null, 2));

  // --- Captura de pantalla completa ---
  if (shotPath) {
    const metrics = await cdp.send('Page.getLayoutMetrics');
    const height = Math.min(Math.ceil(metrics.cssContentSize.height), 8000);
    await cdp.send('Emulation.setDeviceMetricsOverride', {
      width: 1440,
      height,
      deviceScaleFactor: 1,
      mobile: false,
    });
    await sleep(600);
    const shot = await cdp.send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(shotPath, Buffer.from(shot.data, 'base64'));
    console.log(`\ncaptura -> ${shotPath}`);
  }

  ws.close();
} catch (error) {
  console.error('ERROR:', error.message);
  process.exitCode = 1;
} finally {
  chrome.kill();
  // Chrome puede seguir liberando el perfil: reintentamos sin romper el script.
  for (let i = 0; i < 5; i += 1) {
    try {
      fs.rmSync(profile, { recursive: true, force: true });
      break;
    } catch {
      await sleep(400);
    }
  }
}
