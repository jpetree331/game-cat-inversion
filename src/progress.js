(function(root){
  const KEY='nine-lives-above:v1';
  function read(storage,count){try{const raw=JSON.parse(storage.getItem(KEY));return{completed:Array.isArray(raw?.completed)?[...new Set(raw.completed.filter(n=>Number.isInteger(n)&&n>=0&&n<count))]:[],sound:raw?.sound===true}}catch{return{completed:[],sound:false}}}
  function write(storage,data){try{storage.setItem(KEY,JSON.stringify(data));return true}catch{return false}}
  const api={read,write};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.CatProgress=api;
})(globalThis);
