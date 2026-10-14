#!/usr/bin/env bash
set -euo pipefail
cd /workspace/Esquivar
export ANDROID_HOME=/workspace/android-sdk
export ANDROID_USER_HOME=/workspace/android-home
export GRADLE_USER_HOME=/workspace/.gradle
mkdir -p "$ANDROID_HOME/cmdline-tools" "$ANDROID_USER_HOME" "$GRADLE_USER_HOME"
export JAVA_HOME=/workspace/java/jdk-21.0.8+9
if [ ! -x "$JAVA_HOME/bin/javac" ]; then
  curl --location --fail --silent --show-error 'https://github.com/adoptium/temurin21-binaries/releases/download/jdk-21.0.8%2B9/OpenJDK21U-jdk_x64_linux_hotspot_21.0.8_9.tar.gz.sha256.txt' -o /tmp/esquivar-jdk.sha256
  curl --location --fail --silent --show-error 'https://github.com/adoptium/temurin21-binaries/releases/download/jdk-21.0.8%2B9/OpenJDK21U-jdk_x64_linux_hotspot_21.0.8_9.tar.gz' -o /tmp/esquivar-jdk.tar.gz
  python3 - <<'JDKPY'
import pathlib, hashlib, tarfile
p = pathlib.Path('/tmp/esquivar-jdk.tar.gz')
checksum = pathlib.Path('/tmp/esquivar-jdk.sha256').read_text().split()[0]
assert hashlib.sha256(p.read_bytes()).hexdigest() == checksum, 'JDK checksum mismatch'
tarfile.open(p).extractall('/workspace/java', filter='data')
JDKPY
fi
export PATH="$JAVA_HOME/bin:$PATH"
export JAVA_TOOL_OPTIONS="${JAVA_TOOL_OPTIONS:-} -Djavax.net.ssl.trustStore=/etc/ssl/certs/java/cacerts"
java -version
javac -version
npm ci --cache /workspace/.npm-cache
if [ ! -x "$ANDROID_HOME/cmdline-tools/latest/bin/sdkmanager" ]; then
  curl --location --fail --silent --show-error https://dl.google.com/android/repository/commandlinetools-linux-16111833_latest.zip -o /tmp/android-commandlinetools.zip
  python3 - <<'PY'
import hashlib, pathlib, zipfile
p = pathlib.Path('/tmp/android-commandlinetools.zip')
assert hashlib.sha1(p.read_bytes()).hexdigest() == 'e025545c62a8e64c7559119566a569fb1dec5f60', 'SDK checksum mismatch'
zipfile.ZipFile(p).extractall('/workspace/android-sdk/cmdline-tools')
pathlib.Path('/workspace/android-sdk/cmdline-tools/cmdline-tools').rename('/workspace/android-sdk/cmdline-tools/latest')
for p in pathlib.Path('/workspace/android-sdk/cmdline-tools/latest/bin').iterdir():
    p.chmod(0o755)
PY
fi
# Android SDK licenses are required to install its build tools.
python3 - <<'PY'
import subprocess
result = subprocess.run(['/workspace/android-sdk/cmdline-tools/latest/bin/sdkmanager', '--sdk_root=/workspace/android-sdk', '--licenses'], input='y\n' * 100, text=True)
raise SystemExit(result.returncode)
PY
"$ANDROID_HOME/cmdline-tools/latest/bin/sdkmanager" --sdk_root="$ANDROID_HOME" 'platforms;android-36' 'build-tools;36.0.0' 'build-tools;35.0.0' 'platform-tools'
# Java/Gradle does not automatically use the cloud HTTPS proxy.
python3 - <<'PY'
import os, pathlib, urllib.parse
u = urllib.parse.urlparse(os.environ.get('HTTPS_PROXY', ''))
if u.hostname:
    if u.username or u.password:
        raise SystemExit('Use supported cloud proxy authentication; do not save proxy credentials.')
    p = pathlib.Path('/workspace/.gradle/gradle.properties')
    s = p.read_text() if p.exists() else ''
    for protocol in ['http', 'https']:
        for key, value in [('proxyHost', u.hostname), ('proxyPort', str(u.port or 80))]:
            setting = f'systemProp.{protocol}.{key}={value}'
            if setting not in s:
                s += '\n' + setting
    trust = 'systemProp.javax.net.ssl.trustStore=/etc/ssl/certs/java/cacerts'
    if trust not in s:
        s += '\n' + trust
    p.write_text(s + '\n')
PY
npm test
npm run android:sync
cd android
./gradlew --max-workers=2 assembleDebug
