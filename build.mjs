import * as esbuild from 'esbuild';
import { readFileSync } from 'fs';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);
const pkg = JSON.parse(readFileSync('./package.json', 'utf8'));

const commonConfig = {
  bundle: true,
  platform: 'node',
  target: 'node18',
  format: 'esm',
  packages: 'external',
  define: {
    __PKG_NAME__: JSON.stringify(pkg.name),
    __PKG_VERSION__: JSON.stringify(pkg.version),
  },
};

await esbuild.build({
  ...commonConfig,
  entryPoints: [
    'src/index.ts',
    'src/abstract/index.ts',
    'src/decorator/index.ts',
    'src/stereotype/index.ts',
    'src/common/index.ts',
    'src/infrastructure/index.ts',
    'src/error/index.ts',
    'src/telemetry/index.ts',
  ],
  outdir: 'dist',
  outbase: 'src',
  splitting: true,
  chunkNames: 'chunks/[name]-[hash]',
});

console.log('Build completed!');

console.log('Generating TypeScript declarations...');
await execAsync('tsc --emitDeclarationOnly --declaration --outDir dist');
console.log('TypeScript declarations generated!');
