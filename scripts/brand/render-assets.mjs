// Gera os PNGs do app e da loja a partir de assets/brand/*.svg.
// Uso (resvg não fica nas deps do projeto):
//   npm i --no-save @resvg/resvg-js && node scripts/brand/render-assets.mjs
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { Resvg } from '@resvg/resvg-js';

const C = { primary: '#0e4d5c', sand: '#f7f5f0', accent: '#21c0a8', highlight: '#ff7a1a' };
const mark = readFileSync('assets/brand/mark.svg', 'utf8').replace(/<!--[\s\S]*?-->/, '');
const fill = (svg, map) => Object.entries(map).reduce((s, [k, v]) => s.replaceAll(`{${k}}`, v), svg);

function png(svg, width, out, opts = {}) {
  const r = new Resvg(svg, { fitTo: { mode: 'width', value: width }, ...opts });
  writeFileSync(out, r.render().asPng());
  console.log('✓', out);
}

const colored = fill(mark, { FISH: C.sand, WAVE: C.accent, PRIZE: C.highlight });
const mono = fill(mark, { FISH: '#ffffff', WAVE: '#ffffff', PRIZE: '#ffffff' });
const withBg = (svg, bg) => svg.replace(/(<svg[^>]*>)/, `$1<rect width="1024" height="1024" fill="${bg}"/>`);

mkdirSync('assets/images', { recursive: true });
mkdirSync('docs/release/store-assets', { recursive: true });

// App (app.json)
png(withBg(colored, C.primary), 1024, 'assets/images/icon.png');
png(colored, 1024, 'assets/images/adaptive-icon.png');
png(mono, 1024, 'assets/images/adaptive-icon-monochrome.png');
png(colored, 512, 'assets/images/splash-icon.png');
png(withBg(colored, C.primary), 48, 'assets/images/favicon.png');

// Loja (Google Play): ícone 512 e arte de destaque 1024×500 por idioma.
png(withBg(colored, C.primary), 512, 'docs/release/store-assets/play-icon-512.png');
const fonts = {
  font: {
    loadSystemFonts: false,
    fontFiles: [
      'node_modules/@expo-google-fonts/sora/700Bold/Sora_700Bold.ttf',
      'node_modules/@expo-google-fonts/inter/500Medium/Inter_500Medium.ttf',
    ],
    defaultFontFamily: 'Inter',
  },
};
const feature = readFileSync('assets/brand/feature-graphic.svg', 'utf8').replace(/<!--[\s\S]*?-->/, '');
const taglines = {
  'pt-BR': ['Pesque, colecione as espécies,', 'dispute o maior peixe.'],
  es: ['Pesca, colecciona las especies,', 'pelea por el pez más grande.'],
  en: ['Fish, collect the species,', 'compete for the biggest catch.'],
};
for (const [lang, [LINE1, LINE2]] of Object.entries(taglines)) {
  png(fill(feature, { LINE1, LINE2 }), 1024, `docs/release/store-assets/feature-graphic-${lang}.png`, fonts);
}
