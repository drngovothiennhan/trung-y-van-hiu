/* Tab "Hôm nay": điểm yếu, lịch 7 ngày, mạch học (chuỗi, XP, mục tiêu), phiên học trộn thẻ + câu hỏi, huy hiệu */
(function(){
const css=`
:root{--gold:#B67A12;--gold-soft:#F8EBCB}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]){--gold:#E8B04A;--gold-soft:#3A2F17}}
:root[data-theme="dark"]{--gold:#E8B04A;--gold-soft:#3A2F17}
.hero{background:linear-gradient(135deg,var(--jade) 0%,color-mix(in srgb,var(--jade) 70%,#0b2a22) 100%);color:#fff;border-radius:20px;padding:18px;display:flex;flex-direction:column;gap:14px;position:relative;overflow:hidden}
.hero::after{content:"医";position:absolute;right:-6px;bottom:-34px;font:700 150px/1 var(--hz);opacity:.09;pointer-events:none}
.hero .top{display:flex;align-items:center;gap:14px}
.hero h2{color:#fff;font-size:21px;margin:0;text-wrap:balance}
.hero p{margin:4px 0 0;opacity:.92;font-size:14px}
.ring{position:relative;width:76px;height:76px;flex:none}
.ring svg{transform:rotate(-90deg)}
.ring b{position:absolute;inset:0;display:grid;place-items:center;font-size:17px;font-variant-numeric:tabular-nums;text-align:center;line-height:1.1}
.ring small{display:block;font-size:10px;opacity:.85;font-weight:500}
.cta{background:#fff;color:var(--jade);border:0;border-radius:14px;padding:14px 18px;min-height:56px;font-weight:700;font-size:16px;display:flex;justify-content:space-between;align-items:center;width:100%;text-align:left}
.cta:active{transform:translateY(1px)}
.cta .s{display:block;font-weight:500;font-size:12.5px;color:var(--muted);margin-top:2px}
.chips3{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}
.mini{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:11px 12px;display:flex;flex-direction:column;gap:2px;min-width:0}
.mini b{font-size:19px;font-variant-numeric:tabular-nums;line-height:1.15}
.mini span{font-size:11.5px;color:var(--muted);line-height:1.35}
.mini.fire b{color:var(--seal)}
.lvbar{height:6px;background:var(--line);border-radius:6px;overflow:hidden;margin-top:6px}
.lvbar i{display:block;height:100%;background:var(--gold);border-radius:6px}
.weak{display:flex;flex-direction:column;gap:8px}
.wk{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:4px 10px;align-items:center;background:var(--card);border:1px solid var(--line);border-radius:14px;padding:12px 14px;min-width:0}
.wk b{font-size:14.5px;min-width:0;overflow-wrap:anywhere}
.wk .wkwhy{font-size:12.5px;color:var(--seal);font-weight:600}
.wk .go{min-height:44px;padding:8px 12px;border-radius:10px;border:1px solid var(--jade);background:var(--jade-soft);color:var(--jade);font-weight:700;font-size:13px}
.wk .bar{grid-column:1/-1;height:6px;margin-top:4px}
.plan{display:flex;flex-direction:column;border:1px solid var(--line);border-radius:14px;background:var(--card);overflow:hidden}
.prow{display:grid;grid-template-columns:64px minmax(0,1fr) auto;gap:10px;align-items:center;padding:11px 14px;border-top:1px solid var(--line);min-width:0}
.prow:first-child{border-top:0}
.prow .d{font-size:12px;color:var(--muted);line-height:1.2;font-variant-numeric:tabular-nums}
.prow .d b{display:block;white-space:nowrap;font-size:15px;color:var(--ink)}
.prow .g{font-weight:600;font-size:14px;min-width:0;overflow-wrap:anywhere}
.prow .g small{display:block;font-weight:500;color:var(--muted);font-size:12px}
.prow.today{background:var(--jade-soft)}
.prow.done .g{text-decoration:line-through;color:var(--muted)}
.prow .st{font-size:12px;font-weight:700;color:var(--ok);white-space:nowrap}
.prow .st.todo{color:var(--jade)}
.grp{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:2px 10px;text-align:left;background:var(--card);border:1px solid var(--line);border-radius:14px;padding:11px 14px;width:100%;align-items:center;min-height:44px}
.grp b{font-size:14.5px;min-width:0;overflow-wrap:anywhere}
.grp .pc{font-size:12.5px;color:var(--muted);font-variant-numeric:tabular-nums}
.grp .bar{grid-column:1/-1;height:6px;margin-top:6px}
.grp .bar i{background:var(--jade)}
.grp.done .bar i{background:var(--gold)}
.badges{display:flex;flex-wrap:wrap;gap:8px}
.badge{display:flex;align-items:center;gap:8px;border:1px dashed var(--line);border-radius:12px;padding:7px 11px;font-size:12.5px;color:var(--muted);opacity:.75;min-width:0}
.badge i{font:700 16px/1 var(--hz);font-style:normal;width:26px;height:26px;border-radius:50%;display:grid;place-items:center;background:var(--line);color:var(--muted);flex:none}
.badge.on{border:1px solid var(--gold);background:var(--gold-soft);color:var(--ink);opacity:1}
.badge.on i{background:var(--gold);color:#fff}
.sesshead{display:flex;align-items:center;gap:10px}
.sesshead .bar{flex:1;height:10px;margin:0;border-radius:8px}
.sesshead .bar i{border-radius:8px;transition:width .35s}
.combo{font-size:12.5px;font-weight:700;color:var(--seal);min-width:64px;text-align:right;white-space:nowrap}
.pop{animation:pop .28s ease-out}
@keyframes pop{0%{transform:scale(.97)}60%{transform:scale(1.02)}100%{transform:scale(1)}}
.xpgain{color:var(--gold);font-weight:700;font-size:13px}
.stars{font:700 34px/1 var(--hz);color:var(--gold);letter-spacing:6px}
.stars .off{color:var(--line)}
@media (prefers-reduced-motion:reduce){.pop{animation:none}.lvbar i{transition:none}}
`;
const st0=document.createElement("style");st0.textContent=css;document.head.appendChild(st0);

const A=()=>window.TVAPI,$=s=>document.querySelector(s);
const GOAL=15,N=10,BX=[0,1,2,4,7,15],DAY=86400000;
const day=d=>window.TVPlan.dateKey(d||new Date());
const qk=f=>f.q.slice(0,60);
function P(){const p=A().S.prog;p.qs=p.qs||{};p.stats=p.stats||{xp:0,streak:0,last:"",days:{},total:0,correct:0};return p}
function lvl(xp){let l=1,need=100,rest=xp;while(rest>=need){rest-=need;l++;need=100+(l-1)*50}return{l,rest,need}}
const TITLES=["Nhập môn","Học trò","Môn sinh","Y sinh","Thầy thuốc trẻ","Lương y","Danh y"];
function streakNow(){const s=P().stats,t=day(),y=day(new Date(Date.now()-DAY));return s.last===t||s.last===y?s.streak:0}
function record(ok,xp){const s=P().stats,t=day(),y=day(new Date(Date.now()-DAY));
  if(s.last!==t){s.streak=(s.last===y?s.streak:0)+1;s.last=t}
  s.days[t]=(s.days[t]||0)+1;s.total++;if(ok)s.correct++;s.xp+=xp;A().saveProg()}
function mastered(f){const q=P().qs[qk(f)];return q&&q.b>=3}
function allItems(){return window.TVF.all()}
function groups(){const g={};allItems().forEach(f=>{(g[f.g]=g[f.g]||[]).push(f)});return Object.entries(g).map(([k,v])=>({k,n:v.length,m:v.filter(mastered).length}))}
function analysis(){return window.TVPlan.analyzeQuestions(allItems(),P().qs,Date.now())}
function attemptsTotal(){return allItems().reduce((n,f)=>n+((P().qs[qk(f)]||{}).n||0),0)}
function unitsWeak(){const api=A();return api.S.units.map(u=>{const vs=u.vocab||[];let m=0;vs.forEach(v=>{const c=api.cardState(u.id+":"+v.zh);if(c&&c.b>=2)m++});
  return {id:u.id,title:u.title,n:vs.length,m,pct:vs.length?Math.round(m/vs.length*100):0}}).filter(u=>u.n>0).sort((a,b)=>a.pct-b.pct)}
function badges(){const s=P().stats,all=allItems(),m=all.filter(mastered).length,fb=P().prog?null:A().S.prog.scores.focus;const best=(A().S.prog.scores.focus||{}).best||0;
  return [["初","Bước đầu",s.total>=1],["三","Chuỗi 3 ngày",s.streak>=3],["七","Chuỗi 7 ngày",s.streak>=7],["五","50 câu đúng",s.correct>=50],["精","Thuộc 30 câu",m>=30],["优","Thi thử từ 80%",best>=80]]}

function buildSession(group){
  const api=A(),{S,shuffle}=api,qs=P().qs,now=Date.now();
  const all=allItems().filter(f=>!group||f.g===group);
  const due=[],fresh=[],rest=[];all.forEach(f=>{const q=qs[qk(f)];(!q?fresh:q.d<=now?due:rest).push(f)});
  const pick=shuffle(due).concat(shuffle(fresh),shuffle(rest)).slice(0,group?N:7);
  const items=pick.map(f=>{const idx=shuffle(f.o.map((_,i)=>i));return{t:"q",f:{...f,o:idx.map(i=>f.o[i]),a:idx.indexOf(f.a)}}});
  if(!group){const cs=api.allVocab().filter(x=>api.isDue(x.k)&&api.cardState(x.k)).concat(api.allVocab().filter(x=>!api.cardState(x.k)));
    shuffle(cs).slice(0,N-items.length).forEach(x=>items.push({t:"c",x}))}
  S.sess={items:shuffle(items),i:0,pick:null,flip:false,xp:0,right:0,n:0,combo:0,best:0,wrong:[],group:group||null,done:false,last:0};
}

function why(q){return window.TVF.why(q)}

function view(v){const api=A(),{S,esc}=api;
  if(S.sess){return S.sess.done?vDone(v):vItem(v)}
  const s=P().stats,L=lvl(s.xp),t=day(),done=s.days[t]||0,pct=Math.min(1,done/GOAL),strk=streakNow();
  const all=allItems(),mc=all.filter(mastered).length;
  const cardsDue=api.allVocab().filter(x=>api.isDue(x.k)).length;
  const grs=analysis(),tries=attemptsTotal(),hasData=tries>=10;
  const plan=window.TVPlan.schedule(grs,s.days,Date.now());
  const todayRow=plan[0];
  const R=32,C=2*Math.PI*R,msg=done>=GOAL?"Đủ mục tiêu hôm nay. Học thêm để thuộc chắc hơn.":done>0?`Còn ${GOAL-done} lượt nữa là đủ mục tiêu hôm nay.`:strk>0?`Chuỗi ${strk} ngày đang chờ. Một phiên 10 câu là giữ được.`:"Một phiên 10 câu mất khoảng 3 phút.";
  const weakTop=grs.filter(g=>g.score>0).slice(0,3);
  const uw=unitsWeak().slice(0,3);
  v.innerHTML=`
  <section class="hero" aria-label="Tiến độ hôm nay">
    <div class="top"><div style="flex:1;min-width:0"><h2>${strk>0?"Chuỗi "+strk+" ngày":"Bắt đầu chuỗi mới"}</h2><p>${esc(msg)}</p></div>
      <div class="ring" aria-hidden="true"><svg width="76" height="76" viewBox="0 0 76 76"><circle cx="38" cy="38" r="${R}" fill="none" stroke="rgba(255,255,255,.25)" stroke-width="7"/><circle cx="38" cy="38" r="${R}" fill="none" stroke="#fff" stroke-width="7" stroke-linecap="round" stroke-dasharray="${C}" stroke-dashoffset="${C*(1-pct)}"/></svg><b>${Math.min(done,GOAL)}<small>/${GOAL}</small></b></div></div>
    <button class="cta" id="go"><span>${todayRow.group&&hasData?"Học phần hôm nay":"Học tiếp"}<span class="s">${todayRow.group&&hasData?esc(todayRow.group)+" · 10 câu · khoảng 3 phút":"10 mục · ưu tiên câu cần ôn"}</span></span><span class="hz" aria-hidden="true" style="font-size:26px">学</span></button>
  </section>
  <section class="chips3">
    <div class="mini fire"><b>${strk}</b><span>ngày liên tiếp</span></div>
    <div class="mini"><b>Cấp ${L.l}</b><span>${TITLES[Math.min(L.l-1,TITLES.length-1)]} · ${s.xp} XP</span><div class="lvbar" role="presentation"><i style="width:${Math.round(L.rest/L.need*100)}%"></i></div></div>
    <div class="mini"><b>${mc}/${all.length}</b><span>câu đã thuộc</span></div>
  </section>

  <section style="display:flex;flex-direction:column;gap:8px">
    <span class="label">Điểm yếu cần ưu tiên</span>
    ${hasData&&weakTop.length?`<div class="weak">${weakTop.map(g=>`<div class="wk"><b>${esc(g.g)}</b><button class="go" data-g="${esc(g.g)}">Luyện nhóm</button><span class="wkwhy">${esc(g.reason)}</span><span class="bar"><i style="width:${Math.max(4,100-Math.round(g.mastered/g.n*100))}%;display:block;height:100%;background:var(--seal);border-radius:6px"></i></span></div>`).join("")}</div>`
      :`<div class="panel"><b>Chưa đủ dữ liệu để chỉ ra điểm yếu</b><p class="note" style="margin:4px 0 0">Làm một phiên 10 câu. Sau ${10-Math.min(tries,10)} lượt trả lời, app sẽ tự xếp nhóm yếu lên đầu.</p></div>`}
  </section>

  <section style="display:flex;flex-direction:column;gap:8px">
    <span class="label">Lịch 7 ngày · tự cập nhật theo kết quả</span>
    <div class="plan">${plan.map(r=>`<div class="prow ${r.today?"today":""} ${r.done?"done":""}">
      <div class="d"><b>${r.today?"Hôm nay":r.wd}</b>${r.label}</div>
      <div class="g">${esc(r.group||"Chưa có dữ liệu")}<small>${r.group?esc(r.reason)+" · "+r.items+" câu · khoảng "+r.minutes+" phút":"Làm một phiên để lập lịch"}</small></div>
      ${r.done?`<span class="st">✓ Đã học</span>`:r.today&&r.group?`<button class="btn pri" style="min-height:44px;padding:8px 12px" data-g="${esc(r.group)}">Học</button>`:`<span class="st todo">Chờ</span>`}
    </div>`).join("")}</div>
  </section>

  <section class="panel row" style="justify-content:space-between"><div style="flex:1;min-width:0"><b>Thẻ từ cần ôn</b><div class="note">${cardsDue} thẻ đến hạn${uw.length?" · yếu nhất: "+esc(uw[0].title)+" ("+uw[0].pct+"% thuộc)":""}</div></div><button class="btn" id="cards" style="min-height:44px">Ôn thẻ</button></section>

  <section style="display:flex;flex-direction:column;gap:8px"><span class="label">Độ thuộc theo nhóm · chạm để luyện riêng</span>
    ${groups().map(g=>{const p=Math.round(g.m/g.n*100);return `<button class="grp ${p>=80?"done":""}" data-g="${esc(g.k)}"><b>${esc(g.k)}</b><span class="pc">${g.m}/${g.n} · ${p}%</span><span class="bar"><i style="width:${p}%;display:block;height:100%;border-radius:6px"></i></span></button>`}).join("")}</section>

  <section style="display:flex;flex-direction:column;gap:8px"><span class="label">Thành tích</span><div class="badges">${badges().map(b=>`<span class="badge ${b[2]?"on":""}"><i>${b[0]}</i>${b[1]}</span>`).join("")}</div></section>`;

  $("#go").onclick=()=>{buildSession(todayRow.group&&hasData?todayRow.group:null);api.render();scrollTo(0,0)};
  $("#cards").onclick=()=>{S.tab="cards";api.render()};
  v.querySelectorAll("[data-g]").forEach(b=>b.onclick=()=>{buildSession(b.dataset.g);api.render();scrollTo(0,0)});
}

function head(Q){return `<div class="sesshead"><button class="chip" id="stop" style="min-height:44px">Thoát</button><div class="bar" role="progressbar" aria-valuemin="0" aria-valuemax="${Q.items.length}" aria-valuenow="${Q.i}"><i style="width:${Q.i/Q.items.length*100}%;display:block;height:100%;background:var(--jade)"></i></div><span class="combo">${Q.combo>=2?"Chuỗi đúng "+Q.combo:Q.i+1+"/"+Q.items.length}</span></div>`}

function vItem(v){const api=A(),{S,esc}=api,Q=S.sess,it=Q.items[Q.i];
  const next=(label)=>`<button class="btn pri" id="nx" style="align-self:flex-end;min-height:44px">${label}</button>`;
  const last=Q.i+1>=Q.items.length;
  if(it.t==="q"){const q=it.f,p=Q.pick;
    v.innerHTML=head(Q)+`<div class="panel ${p!=null?"pop":""}" style="display:flex;flex-direction:column;gap:14px"><span class="note">${esc(q.g)}</span><div class="qq">${esc(q.q)}</div>
      <div class="opts">${q.o.map((o,i)=>`<button class="opt ${p==null?"":i===q.a?"right":i===p?"wrong":""}" data-o="${i}" ${p==null?"":"disabled"}><span class="k">${"ABCD"[i]}</span><span>${esc(o)}</span></button>`).join("")}</div>
      ${p==null?"":`<div class="${p===q.a?"xpgain":"note"}">${p===q.a?"Đúng · +"+Q.last+" XP":"Chưa đúng. Đọc mẹo rồi nhớ lại ở lượt sau."}</div>`+why(q)+next(last?"Xem kết quả":"Tiếp tục")}</div>`;
    v.querySelectorAll("[data-o]").forEach(b=>b.onclick=()=>{if(Q.pick!=null)return;const k=+b.dataset.o,ok=k===q.a;Q.pick=k;Q.n++;
      const key=qk(q),cur=P().qs[key]||{b:0,d:0,n:0,w:0},nb=ok?Math.min(cur.b+1,BX.length-1):0;
      P().qs[key]={b:nb,d:Date.now()+(ok?BX[nb]*DAY:0),n:(cur.n||0)+1,w:(cur.w||0)+(ok?0:1)};
      let xp=ok?10:2;if(ok){Q.right++;Q.combo++;Q.best=Math.max(Q.best,Q.combo);if(Q.combo>=3)xp+=5}else{Q.combo=0;Q.wrong.push({...q,p:k})}
      Q.last=xp;Q.xp+=xp;record(ok,xp);api.render()});
  }else{const w=it.x.v,len=[...w.zh].length,sz=len>4?"s":len>2?"m":"";
    v.innerHTML=head(Q)+`<div class="card" id="fc" role="button" tabindex="0" aria-label="Lật thẻ"><span class="from">Thẻ từ · ${esc(it.x.u.title)}</span>
      <div class="grid ${len>1?"wide":""}"><div class="big ${sz}">${esc(w.zh)}</div></div>
      ${Q.flip?`<div class="py">${esc(w.py)}</div><div class="hv">${esc(w.hv)}</div><div class="vi">${esc(w.vi)}</div>`:`<span class="hint">Nhớ nghĩa rồi chạm để lật</span>`}</div>
      <div class="grade"><button class="btn no" id="no" style="min-height:48px" ${Q.flip?"":"disabled"}>Chưa nhớ</button><button class="btn yes" id="yes" style="min-height:48px" ${Q.flip?"":"disabled"}>Đã nhớ</button></div>`;
    $("#fc").onclick=()=>{if(!Q.flip){Q.flip=true;api.render()}};
    const g=ok=>{const c=api.cardState(it.x.k)||{b:0,d:0},b=ok?Math.min(c.b+1,BX.length-1):0;api.S.prog.cards[it.x.k]={b,d:Date.now()+(ok?BX[b]*DAY:0)};
      Q.n++;if(ok){Q.right++;Q.combo++;Q.best=Math.max(Q.best,Q.combo)}else Q.combo=0;const xp=ok?5:1;Q.xp+=xp;record(ok,xp);Q.flip=false;adv()};
    $("#no").onclick=()=>g(false);$("#yes").onclick=()=>g(true);
  }
  $("#stop").onclick=()=>{S.sess=null;api.render()};
  const nx=$("#nx");if(nx){nx.onclick=adv;nx.focus()}
  function adv(){Q.i++;Q.pick=null;Q.flip=false;if(Q.i>=Q.items.length){Q.done=true;Q.xp+=20;P().stats.xp+=20;api.saveProg()}api.render();scrollTo(0,0)}
}

function vDone(v){const api=A(),{S,esc}=api,Q=S.sess,pct=Q.n?Math.round(Q.right/Q.n*100):0,stars=pct>=90?3:pct>=70?2:1;
  const t=day(),done=P().stats.days[t]||0,L=lvl(P().stats.xp);
  const msg=pct>=90?"Rất chắc. Phần này sắp thuộc rồi.":pct>=70?"Tốt. Vài câu nữa là vững.":"Mới bắt đầu thôi. Đọc mẹo ở các câu sai, mai sẽ nhớ hơn.";
  v.innerHTML=`<div class="panel pop" style="display:flex;flex-direction:column;gap:10px;align-items:flex-start">
    <span class="label">Xong phiên học</span>
    <div class="stars" aria-label="${stars} trên 3 sao">${"星".repeat(stars)}<span class="off">${"星".repeat(3-stars)}</span></div>
    <div class="score">${pct}%</div>
    <p class="lead">${esc(msg)} Đúng ${Q.right}/${Q.n}, chuỗi đúng dài nhất ${Q.best}.</p>
    <div class="xpgain">+${Q.xp} XP · Cấp ${L.l} · hôm nay ${Math.min(done,GOAL)}/${GOAL}${done>=GOAL?" · đủ mục tiêu":""}</div>
    <div class="row"><button class="btn pri" id="more" style="min-height:44px">Học tiếp ${N} mục</button><button class="btn" id="home" style="min-height:44px">Về Hôm nay</button></div></div>
    ${Q.wrong.length?`<div class="panel review"><span class="label">Xem lại câu sai (${Q.wrong.length})</span>${Q.wrong.map(w=>`<div class="r"><div class="hz">${esc(w.q)}</div><div>Đáp án: <b class="hz" style="color:var(--ok)">${esc(w.o[w.a])}</b></div>${why(w)}</div>`).join("")}</div>`:""}`;
  $("#more").onclick=()=>{const g=Q.group;buildSession(g);api.render();scrollTo(0,0)};
  $("#home").onclick=()=>{S.sess=null;api.render();scrollTo(0,0)};
}
window.TVT={view};
})();
