/* Tab "Trọng tâm 80/20": mẹo nhớ + trắc nghiệm có giải thích. Dữ liệu: window.TV_EXTRA (focus-data.js). */
(function(){
const css=`
.why{border-left:3px solid var(--jade);background:var(--jade-soft);border-radius:8px;padding:9px 12px;display:flex;flex-direction:column;gap:6px;font-size:14px;line-height:1.5}
.why .tip{color:var(--seal);font-weight:600}
.why .tip .tag{margin-right:6px}
.tipbox{display:flex;flex-direction:column;gap:8px}
.tipbox .t{border:1px solid var(--line);border-radius:10px;padding:9px 12px;background:var(--paper)}
.tipbox .t b{display:block;color:var(--jade);font-size:14px}
.tipbox .t span{font-size:14px}
.fq{display:flex;flex-direction:column;gap:8px;padding:12px 0;border-top:1px solid var(--line)}
.fq:first-child{border-top:0;padding-top:0}
.fq .qq{font-size:17px}
.fq .ok{font:500 16px/1.5 var(--hz);color:var(--ok)}
.fq .cover{align-self:flex-start;font-size:13px}
details>summary{cursor:pointer;font-weight:600;list-style:none}
details>summary::-webkit-details-marker{display:none}
`;
const st=document.createElement("style");st.textContent=css;document.head.appendChild(st);

const A=()=>window.TVAPI;
let _x=null;
const X=()=>{if(_x)return _x;const e=window.TV_EXTRA||{tips:[],focus:[],units:[]};
  const de=((e.units||[]).find(u=>u.id==="u09")||{mcq:[]}).mcq.filter(m=>m.s).map(m=>({...m,g:"Đề Câu 1–50"}));
  return (_x={tips:e.tips||[],focus:de.concat(e.focus||[])})};
const bank=()=>{const u=(A().S.units||[]).find(x=>x.id==="bank");return u?(u.mcq||[]).filter(m=>Array.isArray(m.o)&&m.o.length>1).map(m=>({...m,g:m.g||"Bổ sung",s:m.s||"b"})):[]};
const ALL=()=>X().focus.concat(bank());
const G=()=>[...new Set(ALL().map(f=>f.g))];
const F={mode:"learn",g:null,hide:false,seen:{},n:20,quiz:null};

function why(q){
  if(!q||(!q.e&&!q.t))return "";
  const esc=A().esc;
  const tg=q.s==="v"?`<span class="tag j">Đã khớp video</span>`:q.s==="d"?`<span class="tag">Theo đề cương HIU, chưa đối chiếu video</span>`:q.s==="p"?`<span class="tag j">Theo slide thầy Nhan Hồng Tâm, chưa đối chiếu đề thi</span>`:q.s==="c"?`<span class="tag">Đáp án do Claude giải, chờ thầy đối chiếu</span>`:"";
  return `<div class="why">${tg?`<div>${tg}</div>`:""}${q.f?`<div><b>Lưu ý:</b> ${esc(q.f)}</div>`:""}${q.e?`<div><b>Giải thích:</b> ${esc(q.e)}</div>`:""}${q.t?`<div class="tip"><span class="tag">Mẹo nhớ</span>${esc(q.t)}</div>`:""}</div>`}

function pool(){return ALL().filter(f=>!F.g||f.g===F.g)}

function head(esc){
  const gs=G(),n=ALL().length;
  return `<div class="panel" style="display:flex;flex-direction:column;gap:10px">
    <h2>Trọng tâm <span class="hz" style="color:var(--seal)">要点</span></h2>
    <p class="lead">${n} câu trắc nghiệm gom đủ nội dung đã tổng hợp, gồm đủ 50 câu đề cương Dược liệu & phương tễ, mỗi câu có giải thích và mẹo nhớ. Học nhanh để nhìn là nhớ, rồi Thi thử để kiểm tra.</p>
    <details><summary class="tag j" style="align-self:flex-start;padding:5px 12px;font-size:12.5px">Xem ${X().tips.length} điều cần nhớ trước</summary>
      <div class="tipbox" style="margin-top:10px">${X().tips.map(t=>`<div class="t"><b>${esc(t.h)}</b><span>${esc(t.b)}</span></div>`).join("")}</div></details>
    <div class="seg"><button class="chip" data-m="learn" aria-pressed="${F.mode==="learn"}">Học nhanh</button><button class="chip" data-m="test" aria-pressed="${F.mode==="test"}">Thi thử</button></div>
    <div class="seg"><button class="chip" data-g="" aria-pressed="${!F.g}">Tất cả · ${n}</button>${gs.map(g=>`<button class="chip" data-g="${esc(g)}" aria-pressed="${F.g===g}">${esc(g)} · ${ALL().filter(f=>f.g===g).length}</button>`).join("")}</div>
  </div>`}

function bind(v){
  const api=A();
  v.querySelectorAll("[data-m]").forEach(b=>b.onclick=()=>{F.mode=b.dataset.m;F.quiz=null;F.limit=20;api.render()});
  v.querySelectorAll("[data-g]").forEach(b=>b.onclick=()=>{F.g=b.dataset.g||null;F.quiz=null;F.seen={};F.limit=20;api.render()});
}

function learn(v){
  const {esc}=A(),L=pool(),PG=L.slice(0,F.limit||20);
  v.innerHTML=head(esc)+`<div class="panel">
    <div class="row" style="justify-content:space-between;margin-bottom:8px"><span class="label">${L.length} câu · đáp án và mẹo hiện sẵn</span>
      <button class="chip" id="hideBtn" aria-pressed="${F.hide}">Che đáp án để tự kiểm tra</button></div>
    ${PG.map((f,i)=>{const show=!F.hide||F.seen[f.q];return `<div class="fq"><span class="note">${i+1}. ${esc(f.g)}</span><div class="qq">${esc(f.q)}</div>
      ${show?`<div class="ok">Đáp án: ${"ABCD"[f.a]}. ${esc(f.o[f.a])}</div><div class="note">${f.o.map((o,j)=>j===f.a?"":`${"ABCD"[j]}. ${esc(o)}`).filter(Boolean).join(" · ")}</div>${why(f)}`
      :`<button class="btn cover" data-s="${i}">Xem đáp án</button>`}</div>`}).join("")}${L.length>PG.length?`<button class="btn" id="moreQ" style="align-self:flex-start;margin-top:8px">Hiện thêm ${Math.min(20,L.length-PG.length)} câu · còn ${L.length-PG.length}</button>`:""}</div>`;
  bind(v);
  const mq=$("#moreQ");if(mq)mq.onclick=()=>{F.limit=(F.limit||20)+20;const y=scrollY;A().render();scrollTo(0,y)};
  $("#hideBtn").onclick=()=>{F.hide=!F.hide;F.seen={};A().render()};
  v.querySelectorAll("[data-s]").forEach(b=>b.onclick=()=>{F.seen[L[+b.dataset.s].q]=true;const y=scrollY;A().render();scrollTo(0,y)});
}

function startTest(){
  const {shuffle}=A(),n=F.n,qs=shuffle(pool()).slice(0,n).map(q=>{const idx=shuffle(q.o.map((_,i)=>i));return {...q,u:q.g,o:idx.map(i=>q.o[i]),a:idx.indexOf(q.a)}});
  F.quiz={qs,i:0,pick:null,right:0,wrong:[],t0:Date.now(),group:F.g};
}

function test(v){
  const api=A(),{esc,S}=api,Q=F.quiz;
  if(!Q){
    const sc=S.prog.scores.focus;
    v.innerHTML=head(esc)+`<div class="panel" style="display:flex;flex-direction:column;gap:12px">
      <span class="label">Số câu</span><div class="row">${[10,20,40].map(k=>`<button class="chip" data-n="${k}" aria-pressed="${F.n===k}">${k} câu</button>`).join("")}</div>
      <button class="btn pri" id="go" style="align-self:flex-start">Bắt đầu thi thử${F.g?" · "+esc(F.g):""}</button>
      ${sc?`<p class="note">Lần cuối ${sc.last}% · cao nhất ${sc.best}%. Mục tiêu từ 80% trở lên.</p>`:""}</div>`;
    bind(v);v.querySelectorAll("[data-n]").forEach(b=>b.onclick=()=>{F.n=+b.dataset.n;api.render()});
    $("#go").onclick=()=>{startTest();api.render();scrollTo(0,0)};return}
  if(Q.i>=Q.qs.length){
    const pct=Math.round(Q.right/Q.qs.length*100);
    if(!Q.group&&!Q.saved){const o=S.prog.scores.focus||{best:0};S.prog.scores.focus={best:Math.max(o.best,pct),last:pct};Q.saved=1;api.saveProg()}
    v.innerHTML=`<div class="panel" style="display:flex;flex-direction:column;gap:10px;align-items:flex-start">
      <span class="label">Kết quả</span><div class="score">${pct}%</div><p class="lead">Đúng ${Q.right}/${Q.qs.length} câu. ${pct>=80?"Đạt mức sẵn sàng thi.":"Đọc lại giải thích và mẹo ở các câu sai rồi làm lại."}</p>
      <div class="row"><button class="btn pri" id="again">Làm đề mới</button><button class="btn" id="back">Về Trọng tâm</button></div></div>
      ${Q.wrong.length?`<div class="panel review"><span class="label">Câu sai (${Q.wrong.length})</span>${Q.wrong.map(w=>`<div class="r"><div class="hz">${esc(w.q)}</div><div>Đáp án: <b class="hz" style="color:var(--ok)">${esc(w.o[w.a])}</b></div><small>Bạn chọn: <span class="hz">${esc(w.o[w.p])}</span> · ${esc(w.g)}</small>${why(w)}</div>`).join("")}</div>`:""}`;
    $("#again").onclick=()=>{startTest();api.render();scrollTo(0,0)};$("#back").onclick=()=>{F.quiz=null;api.render()};return}
  const q=Q.qs[Q.i],p=Q.pick;
  v.innerHTML=`<div class="row" style="justify-content:space-between"><span class="prog">Câu ${Q.i+1}/${Q.qs.length} · đúng ${Q.right}</span><button class="chip" id="stop">Dừng</button></div>
    <div class="bar"><i style="width:${Q.i/Q.qs.length*100}%"></i></div>
    <div class="panel" style="display:flex;flex-direction:column;gap:14px"><span class="note">${esc(q.g)}</span><div class="qq">${esc(q.q)}</div>
    <div class="opts">${q.o.map((o,i)=>`<button class="opt ${p==null?"":i===q.a?"right":i===p?"wrong":""}" data-o="${i}" ${p==null?"":"disabled"}><span class="k">${"ABCD"[i]}</span><span>${esc(o)}</span></button>`).join("")}</div>
    ${p==null?"":why(q)+`<button class="btn pri" id="nx" style="align-self:flex-end">${Q.i+1<Q.qs.length?"Câu tiếp":"Xem kết quả"}</button>`}</div>`;
  $("#stop").onclick=()=>{F.quiz=null;api.render()};
  v.querySelectorAll("[data-o]").forEach(b=>b.onclick=()=>{if(Q.pick!=null)return;Q.pick=+b.dataset.o;if(Q.pick===q.a)Q.right++;else Q.wrong.push({...q,p:Q.pick});api.render()});
  if(p!=null){const nx=$("#nx");nx.onclick=()=>{Q.i++;Q.pick=null;api.render();scrollTo(0,0)};nx.focus()}
}

function addBox(v){
  const api=A(),{S,esc}=api;
  const n=bank().length;
  const d=document.createElement("div");d.className="panel";d.style.cssText="display:flex;flex-direction:column;gap:10px";
  if(!S.db||!S.canEdit){d.innerHTML=`<h3>Ngân hàng câu hỏi (${n} câu thêm)</h3><p class="note">Câu hỏi mới do người soạn thêm sẽ tự xuất hiện ở đây và trong mục Hôm nay. Bạn gửi câu cần thêm cho người soạn.</p>`;v.appendChild(d);return}
  d.innerHTML=`<h3>Thêm câu hỏi mới (${n} câu đã thêm)</h3>
  <p class="note">Mỗi dòng một câu: <b>câu hỏi | A | B | C | D | đáp án (A–D) | giải thích | mẹo nhớ | nhóm</b>. Giải thích, mẹo, nhóm có thể bỏ trống. Gửi slide hoặc ảnh cho Claude để soạn sẵn các dòng này rồi dán vào.</p>
  <textarea id="bkx" placeholder="黄芪能够... | Đáp án A | Đáp án B | Đáp án C | Đáp án D | B | Vì sao đúng | Mẹo nhớ | Dược liệu"></textarea>
  <button class="btn pri" id="bkgo" style="align-self:flex-start">Thêm vào ngân hàng</button>`;
  v.appendChild(d);
  d.querySelector("#bkgo").onclick=async()=>{
    const raw=d.querySelector("#bkx").value.split("\n").map(x=>x.trim()).filter(Boolean),add=[],bad=[];
    raw.forEach((ln,i)=>{const p=ln.split("|").map(x=>x.trim());let k=-1;for(let j=3;j<p.length;j++)if(/^[A-Da-d]$/.test(p[j])){k=j;break}
      if(k<0){bad.push(i+1);return}
      const o=p.slice(1,k).filter(Boolean),a="ABCD".indexOf(p[k].toUpperCase());
      if(o.length<2||a<0||a>=o.length){bad.push(i+1);return}
      add.push({q:p[0],o,a,e:p[k+1]||"",t:p[k+2]||"",g:p[k+3]||"Bổ sung",s:"b"})});
    if(bad.length)return api.toast("Dòng lỗi: "+bad.join(", ")+". Kiểm tra số lựa chọn và đáp án");
    if(!add.length)return api.toast("Chưa có dòng nào");
    const cur=(S.units||[]).find(x=>x.id==="bank"),body=cur?JSON.parse(JSON.stringify(cur)):{order:99,title:"Ngân hàng câu hỏi",zh:"题库",teacher:"",source:"Câu hỏi thêm sau khi ôn.",vocab:[],passage:[],grammar:[],pairs:[],fills:[],qa:[],mcq:[]};
    delete body.id;body.mcq=(body.mcq||[]).concat(add);
    try{await S.db.doc("units/bank").set(body);d.querySelector("#bkx").value="";api.toast("Đã thêm "+add.length+" câu")}catch(e){api.toast("Không lưu được: "+(e.code||e.message))}};
}
const $=s=>document.querySelector(s);

window.TVF={why,all:ALL,view(v){
  if(!X().focus.length){v.innerHTML=`<div class="panel empty">Chưa tải được dữ liệu Trọng tâm. Tải lại trang.</div>`;return}
  (F.mode==="test"?test:learn)(v);addBox(v)}};
})();
