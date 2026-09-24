import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {mkdtempSync,writeFileSync,readFileSync,copyFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {resolveSource} from './source.mjs';
import {measureCSS, assertCSSParity} from './browser-css.mjs';
const root=fileURLToPath(new URL('../',import.meta.url));
const dir=mkdtempSync(join(tmpdir(),'tokens-pack-'));
function run(cmd,args,cwd=dir) {
  const r=spawnSync(cmd,args,{cwd,encoding:'utf8'});
  if(r.status!==0) throw new Error(`${cmd} ${args.join(' ')}\n${r.stdout}\n${r.stderr}\nexit=${r.status}`);
  return r.stdout;
}
try {
  const [pack]=JSON.parse(run('npm',['pack','--json','--ignore-scripts','--pack-destination',dir],root));
  const files=pack.files.map(f=>f.path);
  for(const required of ['dist/index.js','dist/index.d.ts','dist/colors.css','dist/colors.ts','dist/resolved.json','tokens/colors.json','tokens/schema.json','THIRD_PARTY_NOTICES.md','tokens/upstream/basalt-2.1.8/LICENSE']) assert.ok(files.includes(required),required);
  assert.ok(!files.some(p=>/^(node_modules|\.github|\.build|examples\/demo)\//.test(p)));
  assert.deepEqual(files.filter(p=>p.startsWith('scripts/')), ['scripts/check-ai-contract.mjs']);
  assert.ok(files.filter(p=>p.startsWith('tests/')).every(p=>p.startsWith('tests/DesignTokensTests/')));
  console.log(`Packed ${pack.filename}: ${pack.entryCount} files, ${pack.size} bytes`);
  writeFileSync(join(dir,'package.json'),JSON.stringify({private:true,type:'module'}));
  console.log(run('npm',['install','--offline','--ignore-scripts','--no-audit','--no-fund','--omit=dev',join(dir,pack.filename)]));
  const installed=JSON.parse(readFileSync(join(dir,'node_modules/@leepepe/design-tokens/package.json')));
  assert.equal(installed.private,true); assert.equal(installed.dependencies,undefined); assert.equal(installed.peerDependencies,undefined);
  copyFileSync(join(root,'tests/consumer/consumer.ts'),join(dir,'consumer.ts'));
  run(process.execPath,[join(root,'node_modules/typescript/bin/tsc'),'--strict','--target','ES2022','--module','NodeNext','--moduleResolution','NodeNext','--outDir','out','consumer.ts']);
  console.log(run(process.execPath,['out/consumer.js']));
  console.log(run(process.execPath,['--input-type=module','-e',`import {readFileSync} from 'node:fs'; import assert from 'node:assert/strict';
    for (const path of ['colors.css','resolved.json','source.json','schema.json']) assert.ok(readFileSync(new URL(import.meta.resolve('@leepepe/design-tokens/'+path))).length > 0);
    try { await import('@leepepe/design-tokens/tokens/upstream/basalt-2.1.8/dist/providers/theme.js'); throw Error('private path exported'); } catch(e) { assert.equal(e.code,'ERR_PACKAGE_PATH_NOT_EXPORTED'); }
    console.log('Package exports and no runtime dependencies verified');`]));
  const assets=JSON.parse(run(process.execPath,['--input-type=module','-e',`
    console.log(JSON.stringify(Object.fromEntries(['colors.css','source.json','resolved.json'].map(name =>
      [name, import.meta.resolve('@leepepe/design-tokens/'+name)]))));`]));
  const resolved=resolveSource(JSON.parse(readFileSync(new URL(assets['source.json']))));
  assert.deepEqual(JSON.parse(readFileSync(new URL(assets['resolved.json']))),resolved);
  const measured=await measureCSS(new URL(assets['colors.css']),Object.keys(resolved.colors));
  assertCSSParity(measured,resolved);
  console.log(`Packed CSS: ${Object.keys(resolved.colors).length} tokens, ${measured.rows.length} computed RGBA/scope rows verified`);
} finally {rmSync(dir,{recursive:true,force:true});}
