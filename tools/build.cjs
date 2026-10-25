const fs=require('node:fs'),path=require('node:path');const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');let html=read('index.html');
html=html.replace('<link rel="stylesheet" href="style.css">',()=>`<style>${read('style.css')}</style>`);
html=html.replace(/<script src="([^"]+)"><\/script>/g,(_,file)=>`<script>\n${read(file)}\n</script>`);
if(/<script src="(?!https:)|href="style.css"/.test(html))throw new Error('Build contains unresolved local assets');
fs.mkdirSync(path.join(root,'dist'),{recursive:true});fs.writeFileSync(path.join(root,'dist','Nine-Lives-Above.html'),html);console.log(`Built dist/Nine-Lives-Above.html (${Buffer.byteLength(html)} bytes). No installation or internet needed to play.`);
