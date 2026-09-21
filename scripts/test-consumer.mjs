import {spawnSync} from 'node:child_process';
import {mkdtempSync, copyFileSync, writeFileSync, mkdirSync, rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';
const root = fileURLToPath(new URL('../',import.meta.url));
const fixture=mkdtempSync(join(tmpdir(),'tokens-consumer-'));
function run(command,args,cwd=fixture) {
  const result=spawnSync(command,args,{cwd,encoding:'utf8'});
  process.stdout.write(result.stdout ?? ''); process.stderr.write(result.stderr ?? '');
  if(result.status!==0) throw new Error(`${command} exited ${result.status}: ${result.error ?? ''}`);
}
try {
  // Copy consumer deliverables only; no symlink backdoor to repository devDependencies.
  const installed=join(fixture,'node_modules/@leepepe/design-tokens'); mkdirSync(join(installed,'dist'),{recursive:true});
  for(const f of ['package.json','dist/index.js','dist/index.d.ts','dist/colors.ts']) copyFileSync(join(root,f),join(installed,f));
  writeFileSync(join(fixture,'package.json'),JSON.stringify({type:'module',private:true}));
  copyFileSync(join(root,'tests/consumer/consumer.ts'),join(fixture,'consumer.ts'));
  run(process.execPath,[join(root,'node_modules/typescript/bin/tsc'),'--strict','--target','ES2022','--module','NodeNext','--moduleResolution','NodeNext','--outDir','out','consumer.ts']);
  run(process.execPath,['out/consumer.js']);
  run(process.execPath,[join(root,'node_modules/typescript/bin/tsc'),'--strict','--target','ES2022','--module','NodeNext','--noEmit',join(installed,'dist/colors.ts')]);
} finally {rmSync(fixture,{recursive:true,force:true});}
