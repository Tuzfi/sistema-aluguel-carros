import { spawn } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { resolve, delimiter } from 'node:path';
const backend = resolve(import.meta.dirname, '../../backend');
const compile = process.platform === 'win32'
  ? spawn('cmd.exe', ['/d', '/s', '/c', 'mvnw.cmd -B test-compile dependency:build-classpath -Dmdep.outputFile=target/classpath.txt'], { cwd: backend, stdio: 'inherit', windowsVerbatimArguments: true })
  : spawn('./mvnw', ['-B', 'test-compile', 'dependency:build-classpath', '-Dmdep.outputFile=target/classpath.txt'], { cwd: backend, stdio: 'inherit', windowsVerbatimArguments: true });
compile.on('exit', code => {
  if (code !== 0) process.exit(code || 1);
  const cp = ['target/test-classes', 'target/classes', readFileSync(resolve(backend, 'target/classpath.txt'), 'utf8').trim()].join(delimiter);
  const server = spawn('java', ['-cp', cp, 'br.edu.viacar.DevServer'], { cwd: backend, stdio: 'inherit', env: process.env });
  for (const signal of ['SIGTERM', 'SIGINT']) process.on(signal, () => server.kill());
  server.on('exit', code => process.exit(code || 0));
});
