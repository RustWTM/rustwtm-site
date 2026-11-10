import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
test('static export includes the preview and its runtime files without replacing the homepage',async()=>{
  const home=await readFile('out/index.html','utf8');
  const html=await readFile('out/preview/index.html','utf8');
  assert.ok(home.includes('href="/preview/"'));
  assert.ok(html.includes('https://rustwtm.com/preview/'));
  assert.equal((html.match(/<h1[ >]/g)||[]).length,1);
  assert.ok(html.includes('Simulated data'));
  for(const file of ['demo.js','model.mjs','style.css'])assert.ok((await readFile(`out/preview/${file}`)).length>0);
  assert.equal((await readFile('out/CNAME','utf8')).trim(),'rustwtm.com');
});
