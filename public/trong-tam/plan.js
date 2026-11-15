/* Phân tích điểm yếu và lịch 7 ngày. Hàm thuần, không đụng DOM. Xuất: window.TVPlan */
(function(){
const DAY=86400000;
const WD=["CN","T2","T3","T4","T5","T6","T7"];
const qk=f=>f.q.slice(0,60);
const pad=n=>String(n).padStart(2,"0");
const dateKey=d=>d.getFullYear()+"-"+pad(d.getMonth()+1)+"-"+pad(d.getDate());

/* items: danh sách câu có trường g (nhóm); qs: tiến độ theo qk(f) = {b, d, n (số lần làm), w (số lần sai)} */
function reasonOf(e,wr,ur){
  if(ur>0.5)return `Chưa làm ${e.unseen}/${e.n} câu`;
  if(e.attempts>=3&&wr>=0.3)return `Sai ${Math.round(wr*100)}% các lần làm`;
  return `Mới thuộc ${e.mastered}/${e.n} câu`;
}
function analyzeQuestions(items, qs, now){
  now=now||Date.now();
  const g={};
  items.forEach(f=>{
    const s=qs[qk(f)]||null;
    const e=(g[f.g]=g[f.g]||{g:f.g,n:0,mastered:0,unseen:0,attempts:0,wrong:0,due:0});
    e.n++;
    if(!s){e.unseen++;return}
    e.attempts+=s.n||0;e.wrong+=s.w||0;
    if(s.b>=3)e.mastered++;
    if(s.d<=now)e.due++;
  });
  return Object.values(g).map(e=>{
    const wr=e.attempts?e.wrong/e.attempts:0,mr=1-e.mastered/e.n,ur=e.unseen/e.n;
    const score=Math.round((0.5*mr+0.3*wr+0.2*ur)*100);
    return {...e,wrongRate:wr,score,reason:reasonOf(e,wr,ur)};
  }).sort((a,b)=>b.score-a.score||a.g.localeCompare(b.g));
}

/* Lịch 7 ngày: ngày chẵn ôn nhóm yếu nhất, ngày lẻ luân phiên các nhóm yếu tiếp theo.
   done: map {"YYYY-MM-DD": số lượt} lấy từ stats.days */
function schedule(groups, done, now){
  now=now||Date.now();done=done||{};
  const pool=groups.filter(g=>g.score>0).slice(0,3);
  const base=pool.length?pool:groups.slice(0,3);
  const out=[];
  for(let i=0;i<7;i++){
    const d=new Date(now+i*DAY);
    let pick=null;
    if(base.length){
      pick=i%2===0?base[0]:(base[1+Math.floor(i/2)%Math.max(1,base.length-1)]||base[0]);
    }
    const key=dateKey(d);
    out.push({
      date:key,wd:WD[d.getDay()],label:pad(d.getDate())+"/"+pad(d.getMonth()+1),
      today:i===0,group:pick?pick.g:null,reason:pick?pick.reason:"",
      done:!!done[key],items:10,minutes:3
    });
  }
  return out;
}

const api={analyzeQuestions,schedule,dateKey};
if(typeof window!=="undefined")window.TVPlan=api;
if(typeof module!=="undefined")module.exports=api;
})();
