// Abre o celular virtual do fishingdex (criado por scripts/android/setup-emulator.ps1) e,
// se passar um .apk, instala e abre o app. Uso:
//   npm run android:emulator                 -> só abre o emulador
//   npm run android:emulator -- app.apk      -> abre, instala o APK e inicia o fishingdex
import { execFileSync, spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { join } from 'node:path';

const sdk = process.env.ANDROID_HOME || join(process.env.LOCALAPPDATA || '', 'Android', 'Sdk');
const exe = process.platform === 'win32' ? '.exe' : '';
const emulator = join(sdk, 'emulator', `emulator${exe}`);
const adb = join(sdk, 'platform-tools', `adb${exe}`);
if (!existsSync(emulator)) {
  console.error('Emulador não encontrado. Rode: powershell -ExecutionPolicy Bypass -File scripts/android/setup-emulator.ps1');
  process.exit(1);
}

const devices = execFileSync(adb, ['devices']).toString();
if (!/emulator-\d+\s+device/.test(devices)) {
  console.log('> Abrindo o emulador fishingdex_pixel...');
  spawn(emulator, ['-avd', 'fishingdex_pixel', '-no-snapshot-save'], { detached: true, stdio: 'ignore' }).unref();
}
execFileSync(adb, ['wait-for-device']);
for (let i = 0; i < 120; i++) {
  const booted = execFileSync(adb, ['shell', 'getprop', 'sys.boot_completed']).toString().trim();
  if (booted === '1') break;
  await new Promise((r) => setTimeout(r, 2000));
}

const apk = process.argv[2];
if (apk) {
  console.log(`> Instalando ${apk}...`);
  execFileSync(adb, ['install', '-r', apk], { stdio: 'inherit' });
  execFileSync(adb, ['shell', 'monkey', '-p', 'com.schulzeedi.fishingdex', '-c', 'android.intent.category.LAUNCHER', '1']);
}
console.log('Pronto.');
