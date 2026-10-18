const {test}=require('node:test'),assert=require('node:assert/strict'),P=require('../src/progress.js');
test('all original completion indices survive the twelve-room expansion',()=>{const completed=[0,1,2,3,4,5,6,7];assert.deepEqual(P.read({getItem:()=>JSON.stringify({completed,sound:true})},12),{completed,sound:true})});
test('corrupt and inaccessible storage falls back to playable defaults',()=>{for(const storage of [null,{getItem(){throw new Error('blocked')}},{getItem(){return '{'}}])assert.deepEqual(P.read(storage,8),{completed:[],sound:false});assert.equal(P.write(null,{}),false)});
test('saved room indices are validated and deduplicated',()=>{assert.deepEqual(P.read({getItem:()=>JSON.stringify({completed:[0,7,7,8,-1,'2',2.5],sound:true})},8),{completed:[0,7],sound:true})});
