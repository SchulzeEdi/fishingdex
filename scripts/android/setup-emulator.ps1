# Instala o emulador oficial do Android (sem Android Studio) e cria o celular virtual do
# fishingdex. Uso: powershell -ExecutionPolicy Bypass -File scripts/android/setup-emulator.ps1
# Aceita a licença do Android SDK (rode só se você concorda com ela).
$ErrorActionPreference = 'Stop'

$Sdk = Join-Path $env:LOCALAPPDATA 'Android\Sdk'
$Avd = 'fishingdex_pixel'
# O sdkmanager virou o "Android CLI" (android sdk): pacotes usam "/"; o avdmanager ainda usa ";".
$ImagePkg = 'system-images/android-36/google_apis_playstore/x86_64'
$Image = 'system-images;android-36;google_apis_playstore;x86_64'
$ToolsZip = 'https://dl.google.com/android/repository/commandlinetools-win-16111833_latest.zip'

if (-not $env:JAVA_HOME) { throw 'JAVA_HOME não definido (precisa de JDK 17+).' }
$env:ANDROID_HOME = $Sdk
$env:ANDROID_SDK_ROOT = $Sdk
New-Item -ItemType Directory -Force $Sdk | Out-Null

$Android = Join-Path $Sdk 'cmdline-tools\latest\bin\android.exe'
if (-not (Test-Path $Android)) {
  Write-Host '> Baixando Android command-line tools...'
  $zip = Join-Path $env:TEMP 'android-cmdline-tools.zip'
  Invoke-WebRequest $ToolsZip -OutFile $zip
  $tmp = Join-Path $env:TEMP 'android-cmdline-tools'
  if (Test-Path $tmp) { Remove-Item -Recurse -Force $tmp }
  Expand-Archive $zip $tmp
  New-Item -ItemType Directory -Force (Join-Path $Sdk 'cmdline-tools') | Out-Null
  Move-Item (Join-Path $tmp 'cmdline-tools') (Join-Path $Sdk 'cmdline-tools\latest')
  Remove-Item $zip, $tmp -Recurse -Force
}

Write-Host '> Instalando platform-tools, emulator e imagem Android 16 (pode demorar)...'
& $Android --sdk=$Sdk sdk install 'platform-tools' 'emulator' $ImagePkg

$AvdManager = Join-Path $Sdk 'cmdline-tools\latest\bin\avdmanager.bat'
$existing = & $AvdManager list avd -c
if ($existing -notcontains $Avd) {
  Write-Host "> Criando o celular virtual $Avd..."
  'no' | & $AvdManager create avd -n $Avd -k $Image -d 'pixel_7' --force
}

Write-Host '> Verificando aceleração de hardware...'
& (Join-Path $Sdk 'emulator\emulator.exe') -accel-check
Write-Host "`nPronto. Abra com: npm run android:emulator"
