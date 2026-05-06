// ========= NAVIGATION =========
  const titles = {
    dashboard: 'Dashboard',
    employees: 'Employees',
    employee:  'Employees / Mahmoud A. El-Sayed',
    services:  'Services',
    reports:   'Reports & analytics',
    settings:  'Settings',
  };
  function show(id){
    document.querySelectorAll('.screen').forEach(s=>s.classList.remove('on'));
    document.getElementById('screen-'+id).classList.add('on');
    document.querySelectorAll('.nav-item').forEach(n=>n.classList.remove('active'));
    const nav = document.querySelector('[data-screen="'+id+'"]');
    if(nav) nav.classList.add('active');
    document.getElementById('crumb').textContent = titles[id] || id;
    window.scrollTo({top:0});
  }
  document.querySelectorAll('[data-screen]').forEach(b=>{
    b.addEventListener('click', ()=> show(b.dataset.screen));
  });

  // ========= UTIL =========
  const colors = ['#7a5530','#3d6c8a','#6b4f7a','#2f6b54','#8a5a3d','#4a4f6b','#7a3d4f','#56693d','#3d6b6b','#7a6630'];
  function avColor(s){ let h=0; for(const c of s) h = (h*31 + c.charCodeAt(0)) % colors.length; return colors[h]; }
  function initials(s){ return s.split(' ').map(w=>w[0]).slice(0,2).join('').toUpperCase(); }
  function fmtSAR(n){ return 'SAR ' + Number(n).toLocaleString(undefined,{maximumFractionDigits:0}); }
  function fmtDate(d){
    if(!d) return 'â€”';
    const dt = (d instanceof Date) ? d : new Date(d);
    if (isNaN(dt)) return d;
    return dt.toLocaleDateString('en-GB', {day:'2-digit', month:'short', year:'numeric'});
  }
  function daysFromNow(d){
    if(!d) return null;
    const dt = (d instanceof Date) ? d : new Date(d);
    if (isNaN(dt)) return null;
    return Math.round((dt - new Date()) / 86400000);
  }
  function autoStatus(s){
    // auto-detect expired / expiring based on date if status not explicit
    const days = daysFromNow(s.expiry);
    if (s.status === 'paid' && days !== null && days < 0) return 'expired';
    if (s.status === 'paid' && days !== null && days <= 30) return 'expiring';
    return s.status;
  }
  function pillLabel(st){ return ({paid:'Paid', pending:'Pending', expiring:'Expiring', expired:'Expired'})[st] || st; }
  function relTime(ts){
    const diff = (Date.now() - ts) / 1000;
    if (diff < 60)    return 'just now';
    if (diff < 3600)  return Math.floor(diff/60) + ' min ago';
    if (diff < 86400) return Math.floor(diff/3600) + ' h ago';
    if (diff < 86400*2) return 'Yesterday';
    return fmtDate(new Date(ts));
  }
  function toast(msg, kind){
    const t = document.getElementById('toast');
    t.innerHTML = (kind==='ok'?'<span style="color:#7ce0a4">âœ“</span> ':'<span style="color:#f1a98a">!</span> ') + msg;
    t.style.opacity = 1;
    t.style.transform = 'translateX(-50%) translateY(0)';
    clearTimeout(window._tt);
    window._tt = setTimeout(()=>{
      t.style.opacity = 0;
      t.style.transform = 'translateX(-50%) translateY(20px)';
    }, 2400);
  }

  // ========= STATE =========
  // Single source of truth: services. Each has employee_id (FK).
  // Aggregates (case file totals, employee list, global services, KPIs) all derive from this.

  const employees = [
    {id:'E1', n:'Mahmoud A. El-Sayed', iqama:'2384-9921-077', joined:'2022-11-14', dept:'Operations', phone:'+966 55 412 8830'},
    {id:'E2', n:'Rajesh Kumar Patel',  iqama:'2298-1140-823', joined:'2023-02-08', dept:'Logistics',  phone:'+966 53 220 1144'},
    {id:'E3', n:'Anna MarÃ­a Cortez',   iqama:'2401-7762-118', joined:'2024-05-21', dept:'Hospitality',phone:'+966 56 887 0231'},
    {id:'E4', n:'Omar Khalid Bukhari', iqama:'2155-3398-940', joined:'2021-08-03', dept:'Operations', phone:'+966 50 661 2208'},
    {id:'E5', n:'Sandeep Reddy',       iqama:'2302-1187-554', joined:'2023-09-12', dept:'Maintenance',phone:'+966 54 909 7733'},
    {id:'E6', n:'Hannah Tjandra',      iqama:'2419-9920-201', joined:'2024-11-04', dept:'Admin',      phone:'+966 58 412 5578'},
  ];
  function getEmp(id){ return employees.find(e=>e.id===id); }

  let _sid = 100;
  function nextId(){ return 'S' + (++_sid); }

  // Service records â€” keyed to employees. Status auto-derives expiring/expired from date.
  const today = new Date(); today.setHours(0,0,0,0);
  function offset(days){ const d = new Date(today); d.setDate(d.getDate()+days); return d.toISOString().slice(0,10); }

  const services = [
    // Mahmoud (E1) â€” feature employee
    {id:nextId(), emp:'E1', type:'Iqama renewal',     price:1200, status:'paid',    issued:offset(-2),   expiry:offset(363),  comment:'Receipt #INV-22041 Â· bank transfer', by:'Faisal Al-Rashid', updated: Date.now() - 9*60*1000},
    {id:nextId(), emp:'E1', type:'Medical insurance', price:1800, status:'pending', issued:offset(-2),   expiry:offset(390),  comment:'Awaiting payment confirmation',     by:'Faisal Al-Rashid', updated: Date.now() - 47*60*1000},
    {id:nextId(), emp:'E1', type:'Work permit',       price:2400, status:'paid',    issued:offset(-360), expiry:offset(13),   comment:'Renewal scheduled',                 by:'Faisal Al-Rashid', updated: Date.now() - 5*86400000},
    {id:nextId(), emp:'E1', type:'Exit re-entry visa',price: 600, status:'paid',    issued:offset(-50),  expiry:offset(98),   comment:'Single-trip visa',                  by:'Faisal Al-Rashid', updated: Date.now() - 50*86400000},
    {id:nextId(), emp:'E1', type:'GOSI registration', price: 950, status:'paid',    issued:offset(-90),  expiry:'',           comment:'Annual contribution',               by:'Faisal Al-Rashid', updated: Date.now() - 90*86400000},
    // Rajesh (E2)
    {id:nextId(), emp:'E2', type:'Medical insurance', price:1800, status:'paid',    issued:offset(-30),  expiry:offset(330),  comment:'',                                  by:'Faisal Al-Rashid', updated: Date.now() - 30*86400000},
    {id:nextId(), emp:'E2', type:'Iqama renewal',     price:1200, status:'paid',    issued:offset(-100), expiry:offset(265),  comment:'',                                  by:'Faisal Al-Rashid', updated: Date.now() - 100*86400000},
    // Anna (E3)
    {id:nextId(), emp:'E3', type:'Medical insurance', price:1800, status:'pending', issued:offset(-3),   expiry:offset(28),   comment:'Renewal in progress',               by:'Faisal Al-Rashid', updated: Date.now() - 3*86400000},
    {id:nextId(), emp:'E3', type:'Iqama renewal',     price:1200, status:'paid',    issued:offset(-180), expiry:offset(185),  comment:'',                                  by:'Faisal Al-Rashid', updated: Date.now() - 180*86400000},
    // Omar (E4)
    {id:nextId(), emp:'E4', type:'Iqama renewal',     price:1200, status:'paid',    issued:offset(-15),  expiry:offset(350),  comment:'',                                  by:'Faisal Al-Rashid', updated: Date.now() - 15*86400000},
    {id:nextId(), emp:'E4', type:'Work permit',       price:2400, status:'paid',    issued:offset(-200), expiry:offset(165),  comment:'',                                  by:'Faisal Al-Rashid', updated: Date.now() - 200*86400000},
    {id:nextId(), emp:'E4', type:'Medical insurance', price:1800, status:'paid',    issued:offset(-60),  expiry:offset(305),  comment:'',                                  by:'Faisal Al-Rashid', updated: Date.now() - 60*86400000},
    // Sandeep (E5)
    {id:nextId(), emp:'E5', type:'Iqama renewal',     price:1200, status:'pending', issued:offset(-1),   expiry:offset(364),  comment:'Pending payment',                   by:'Faisal Al-Rashid', updated: Date.now() - 1*86400000},
    {id:nextId(), emp:'E5', type:'GOSI registration', price: 950, status:'paid',    issued:offset(-40),  expiry:'',           comment:'',                                  by:'Faisal Al-Rashid', updated: Date.now() - 40*86400000},
    // Hannah (E6)
    {id:nextId(), emp:'E6', type:'Iqama renewal',     price:1200, status:'paid',    issued:offset(-25),  expiry:offset(340),  comment:'',                                  by:'Faisal Al-Rashid', updated: Date.now() - 25*86400000},
  ];

  // Currently focused employee (case file). Defaults to E1.
  let currentEmp = 'E1';
  // Modal state: editingId (null = add), defaultEmp
  let editingId = null;

  // ========= DERIVED / RENDER =========
  function empAggregate(empId){
    const items = services.filter(s => s.emp === empId);
    const total   = items.reduce((a,s)=>a+Number(s.price||0), 0);
    const pending = items.filter(s=>s.status==='pending').reduce((a,s)=>a+Number(s.price||0),0);
    const active  = items.filter(s=>{ const st=autoStatus(s); return st!=='expired'; }).length;
    const expiring = items.filter(s=>{ const d=daysFromNow(s.expiry); return d!==null && d>=0 && d<=30; }).length;
    const last = items.length ? Math.max(...items.map(s=>s.updated)) : 0;
    let badge = 'paid';
    if (pending>0) badge = 'pending';
    else if (expiring>0) badge = 'expiring';
    return {items, total, pending, active, expiring, last, badge, count: items.length};
  }

  function renderEmployees(){
    const rows = employees.map((e,i)=>{
      const a = empAggregate(e.id);
      return `
      <tr class="row" onclick="openCase('${e.id}')" style="cursor:pointer">
        <td><input type="checkbox" class="check" onclick="event.stopPropagation()"/></td>
        <td>
          <div class="name-cell">
            <div class="mini-avatar" style="background:${avColor(e.n)}">${initials(e.n)}</div>
            <div class="stack">
              <span style="font-weight:500">${e.n}</span>
              <span style="color:var(--muted); font-size:11.5px">ID â€¢ ${e.id} Â· ${e.dept}</span>
            </div>
          </div>
        </td>
        <td><span class="mono">${e.iqama}</span></td>
        <td class="right num">${a.count}</td>
        <td class="right num" style="${a.pending>0?'color:var(--red); font-weight:500':''}">${a.pending>0?fmtSAR(a.pending):'â€”'}</td>
        <td style="color:var(--muted)">${a.last?relTime(a.last):'â€”'}</td>
        <td><span class="pill ${a.badge}"><span class="dotc"></span>${a.badge==='paid'?'All paid':(a.badge==='pending'?'Pending':'Expiring')}</span></td>
        <td><button class="btn sm ghost" onclick="event.stopPropagation()">â‹¯</button></td>
      </tr>`;
    }).join('');
    document.getElementById('emp-rows').innerHTML = rows;

    const totals = employees.reduce((a,e)=>{ const x=empAggregate(e.id); return {p:a.p+(x.pending>0?1:0), x:a.x+(x.expiring>0?1:0)}; },{p:0,x:0});
    document.getElementById('emp-sub').textContent = `${employees.length} records Â· ${totals.p} with pending payments Â· ${totals.x} with services expiring in 30 days`;
    document.getElementById('emp-pag').textContent = `Showing 1â€“${employees.length} of ${employees.length}`;
  }

  function renderCase(){
    const e = getEmp(currentEmp);
    const a = empAggregate(currentEmp);
    document.getElementById('case-sub').textContent = `${a.count} services on record Â· Joined ${fmtDate(e.joined)} Â· Department: ${e.dept}`;
    document.getElementById('case-name').textContent = e.n;
    document.getElementById('case-name-crumb').textContent = e.n;
    document.getElementById('case-avatar').textContent = initials(e.n);
    document.getElementById('case-avatar').style.background = `linear-gradient(135deg, ${avColor(e.n)}, ${avColor(e.n+'x')})`;
    document.getElementById('case-iqama').textContent = e.iqama;
    document.getElementById('case-phone').textContent = e.phone;
    document.getElementById('case-joined').textContent = fmtDate(e.joined);
    document.getElementById('case-total').textContent = fmtSAR(a.total);
    document.getElementById('case-pending').textContent = fmtSAR(a.pending);
    document.getElementById('case-active').textContent = a.active;
    document.getElementById('case-expiring').textContent = a.expiring;
    document.getElementById('case-count').textContent = `${a.count} record${a.count===1?'':'s'}`;
    document.getElementById('tab-history').textContent = `Service history (${a.count})`;

    const items = a.items.slice().sort((x,y)=>y.updated-x.updated);
    document.getElementById('case-services').innerHTML = items.map(s=>{
      const st = autoStatus(s);
      const days = daysFromNow(s.expiry);
      return `
      <tr class="row">
        <td><span style="font-weight:500">${s.type}</span></td>
        <td class="right num">${fmtSAR(s.price)}</td>
        <td><span class="pill ${st}"><span class="dotc"></span>${pillLabel(st)}</span></td>
        <td class="num" style="color:${st==='expiring'?'var(--amber)':(st==='expired'?'var(--muted)':'var(--ink-2)')}">${fmtDate(s.expiry)}${days!==null && days>=0 && days<=30?` <span style="color:var(--amber); font-size:11px">Â· ${days}d</span>`:''}</td>
        <td style="color:var(--muted); max-width:160px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap" title="${(s.comment||'').replace(/"/g,'&quot;')}">${s.comment||'â€”'}</td>
        <td style="color:var(--muted); font-size:12px">${s.by}</td>
        <td>
          <div style="display:flex; gap:2px">
            <button class="btn sm ghost" title="Edit" onclick="editService('${s.id}')">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 1 1 3 3L7 19l-4 1 1-4Z"/></svg>
            </button>
            <button class="btn sm ghost" title="Toggle paid" onclick="togglePaid('${s.id}')">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M20 6 9 17l-5-5"/></svg>
            </button>
            <button class="btn sm ghost" title="Delete" onclick="confirmDelete('${s.id}')" style="color:var(--red)">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M19 6 18 20a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>
            </button>
          </div>
        </td>
      </tr>`;
    }).join('') || `<tr><td colspan="7" style="text-align:center; color:var(--muted); padding:32px">No services yet Â· <button class="btn sm" onclick="openModal()">+ Add first service</button></td></tr>`;

    // Timeline
    const tl = items.slice().sort((a,b)=>b.updated-a.updated).map(s=>{
      const st = autoStatus(s);
      const days = daysFromNow(s.expiry);
      let descr = (s.comment ? s.comment : `Logged by ${s.by}`);
      if (st==='expiring' && days!==null) descr = `${days} days remaining Â· alert active`;
      return {when:relTime(s.updated), st, t:`${s.type} Â· ${fmtSAR(s.price)}`, d:descr};
    });
    tl.push({when:fmtDate(e.joined), st:'paid', t:'Onboarded', d:`Joined ${e.dept} team`});
    document.getElementById('timeline').innerHTML = tl.map(x=>`
      <div class="tl-item ${x.st}">
        <div class="node"></div>
        <div class="when num">${x.when}</div>
        <div class="what"><div class="t">${x.t}</div><div class="d">${x.d}</div></div>
      </div>`).join('');
  }

  function renderGlobalServices(){
    const all = services.slice().sort((a,b)=>b.updated-a.updated);
    const total = all.reduce((a,s)=>a+Number(s.price||0),0);
    document.getElementById('svc-sub').textContent = `Global view across employees Â· ${all.length} records Â· ${fmtSAR(total)} total`;
    document.getElementById('svc-pag').innerHTML = `Showing all ${all.length} records Â· Total: <b style="color:var(--ink)">${fmtSAR(total)}</b>`;
    document.getElementById('svc-rows').innerHTML = all.map(s=>{
      const e = getEmp(s.emp);
      const st = autoStatus(s);
      return `
      <tr class="row">
        <td><input type="checkbox" class="check"/></td>
        <td>
          <div class="name-cell" style="cursor:pointer" onclick="openCase('${e.id}')">
            <div class="mini-avatar" style="background:${avColor(e.n)}; width:24px;height:24px; font-size:10px">${initials(e.n)}</div>
            <span style="font-weight:500">${e.n}</span>
          </div>
        </td>
        <td>${s.type}</td>
        <td class="right num">${fmtSAR(s.price)}</td>
        <td><span class="pill ${st}"><span class="dotc"></span>${pillLabel(st)}</span></td>
        <td class="num" style="color:${st==='expiring'?'var(--amber)':(st==='expired'?'var(--muted)':'var(--ink-2)')}">${fmtDate(s.expiry)}</td>
        <td style="color:var(--muted)">${s.by}</td>
        <td style="color:var(--muted); font-size:12px">${relTime(s.updated)}</td>
        <td>
          <div style="display:flex; gap:2px">
            <button class="btn sm ghost" onclick="editService('${s.id}')" title="Edit">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 1 1 3 3L7 19l-4 1 1-4Z"/></svg>
            </button>
            <button class="btn sm ghost" onclick="confirmDelete('${s.id}')" title="Delete" style="color:var(--red)">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M3 6h18"/><path d="M19 6 18 20a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>
            </button>
          </div>
        </td>
      </tr>`;
    }).join('');
  }

  function renderDashboard(){
    const all = services;
    const pending = all.filter(s=>s.status==='pending');
    const pendingAmt = pending.reduce((a,s)=>a+Number(s.price||0),0);
    const expiring = all.filter(s=>{ const d=daysFromNow(s.expiry); return d!==null && d>=0 && d<=30; });
    const critical = expiring.filter(s=>{ const d=daysFromNow(s.expiry); return d>=0 && d<=7; });

    document.getElementById('kpi-total-svc').textContent = all.length;
    document.getElementById('kpi-pending').innerHTML = `${fmtSAR(pendingAmt)}<span class="unit">.00</span>`;
    document.getElementById('kpi-pending-cnt').textContent = `${pending.length} record${pending.length===1?'':'s'}`;
    document.getElementById('kpi-expiring').textContent = expiring.length;
    document.getElementById('kpi-critical').textContent = `${critical.length} critical`;

    // Recent activity (top 7 by updated)
    const recent = all.slice().sort((a,b)=>b.updated-a.updated).slice(0,7);
    document.getElementById('recent-rows').innerHTML = recent.map(s=>{
      const e = getEmp(s.emp);
      const st = autoStatus(s);
      const color = st==='paid'?'var(--green)':st==='pending'?'var(--red)':st==='expiring'?'var(--amber)':'var(--muted)';
      return `
      <tr class="row" onclick="openCase('${e.id}')" style="cursor:pointer">
        <td><span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${color}"></span></td>
        <td>
          <div class="name-cell">
            <div class="mini-avatar" style="background:${avColor(e.n)}; width:24px;height:24px; font-size:10px">${initials(e.n)}</div>
            <span style="font-weight:500">${e.n}</span>
          </div>
        </td>
        <td>${s.type}</td>
        <td class="right num">${fmtSAR(s.price)}</td>
        <td><span class="pill ${st}"><span class="dotc"></span>${pillLabel(st)}</span></td>
        <td style="color:var(--muted)">${relTime(s.updated)}</td>
      </tr>`;
    }).join('');

    // Expiring side list
    const exp = expiring.slice().sort((a,b)=>daysFromNow(a.expiry)-daysFromNow(b.expiry)).slice(0,5);
    document.getElementById('expiring-list').innerHTML = exp.map(s=>{
      const e = getEmp(s.emp);
      const days = daysFromNow(s.expiry);
      return `
      <div style="display:flex; padding: 11px 16px; border-bottom: 1px solid var(--line); align-items:center; gap:10px; cursor:pointer" onclick="openCase('${e.id}')">
        <div class="mini-avatar" style="background:${avColor(e.n)}">${initials(e.n)}</div>
        <div class="stack" style="flex:1; min-width:0">
          <span style="font-weight:500; font-size:13px">${e.n}</span>
          <span style="color:var(--muted); font-size:12px">${s.type} Â· ${fmtSAR(s.price)}</span>
        </div>
        <div style="text-align:right">
          <div style="font-weight:500; color:${days<=7?'var(--red)':'var(--amber)'}; font-size:13px" class="num">${days}d</div>
          <div style="color:var(--muted); font-size:11px">left</div>
        </div>
      </div>`;
    }).join('') || `<div style="padding:18px; text-align:center; color:var(--muted); font-size:13px">Nothing expiring soon âœ“</div>`;
  }

  function renderAll(){
    renderDashboard();
    renderEmployees();
    renderCase();
    renderGlobalServices();
  }

  // ========= MODAL / CRUD =========
  function openModal(){
    editingId = null;
    document.getElementById('modal-title').textContent = 'Add service record';
    const e = getEmp(currentEmp);
    document.getElementById('modal-sub').innerHTML = `Recording a new service for <b>${e.n}</b> Â· Iqama ${e.iqama}`;
    document.getElementById('f-type').value = 'Iqama renewal';
    document.getElementById('f-price').value = 1200;
    document.getElementById('f-status').value = 'paid';
    document.getElementById('f-issued').value = new Date().toISOString().slice(0,10);
    const exp = new Date(); exp.setFullYear(exp.getFullYear()+1);
    document.getElementById('f-expiry').value = exp.toISOString().slice(0,10);
    document.getElementById('f-comment').value = '';
    document.getElementById('f-error').style.display='none';
    document.getElementById('btn-save').textContent = 'Save service';
    document.getElementById('btn-save-another').style.display = '';
    document.getElementById('f-now').textContent = new Date().toLocaleString('en-GB',{day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'});
    document.getElementById('modal').classList.add('show');
    setTimeout(()=>document.getElementById('f-price').focus(), 50);
  }
  function editService(id){
    const s = services.find(x=>x.id===id); if(!s) return;
    editingId = id;
    currentEmp = s.emp;
    const e = getEmp(s.emp);
    document.getElementById('modal-title').textContent = 'Edit service record';
    document.getElementById('modal-sub').innerHTML = `Editing service for <b>${e.n}</b> Â· Iqama ${e.iqama}`;
    document.getElementById('f-type').value = s.type;
    document.getElementById('f-price').value = s.price;
    document.getElementById('f-status').value = s.status;
    document.getElementById('f-issued').value = s.issued || '';
    document.getElementById('f-expiry').value = s.expiry || '';
    document.getElementById('f-comment').value = s.comment || '';
    document.getElementById('f-error').style.display='none';
    document.getElementById('btn-save').textContent = 'Save changes';
    document.getElementById('btn-save-another').style.display = 'none';
    document.getElementById('f-now').textContent = 'Edit will be logged ' + new Date().toLocaleString('en-GB',{day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'});
    document.getElementById('modal').classList.add('show');
  }
  function closeModal(){ document.getElementById('modal').classList.remove('show'); }

  function saveService(addAnother){
    const type   = document.getElementById('f-type').value;
    const price  = Number(document.getElementById('f-price').value);
    const status = document.getElementById('f-status').value;
    const issued = document.getElementById('f-issued').value;
    const expiry = document.getElementById('f-expiry').value;
    const comment= document.getElementById('f-comment').value.trim();
    const err = document.getElementById('f-error');

    if (!type)               { err.textContent='Service type is required'; err.style.display='block'; return; }
    if (!price || price <= 0){ err.textContent='Price must be greater than 0'; err.style.display='block'; return; }
    if (!issued)             { err.textContent='Issued date is required'; err.style.display='block'; return; }
    err.style.display='none';

    if (editingId){
      const s = services.find(x=>x.id===editingId);
      Object.assign(s, {type, price, status, issued, expiry, comment, updated: Date.now(), by:'Faisal Al-Rashid'});
      toast('Service updated Â· ' + fmtSAR(price), 'ok');
      editingId = null;
    } else {
      services.push({id:nextId(), emp:currentEmp, type, price, status, issued, expiry, comment, by:'Faisal Al-Rashid', updated: Date.now()});
      toast('Service added Â· ' + fmtSAR(price), 'ok');
    }
    renderAll();
    if (addAnother && !editingId){
      document.getElementById('f-comment').value = '';
      document.getElementById('f-price').value = '';
      document.getElementById('f-price').focus();
    } else {
      closeModal();
    }
  }

  function togglePaid(id){
    const s = services.find(x=>x.id===id); if(!s) return;
    s.status = (s.status==='paid')?'pending':'paid';
    s.updated = Date.now();
    toast(`Marked as ${s.status}`, 'ok');
    renderAll();
  }

  let _delId = null;
  function confirmDelete(id){
    _delId = id;
    const s = services.find(x=>x.id===id);
    document.getElementById('confirm-sub').innerHTML = `This will permanently remove <b>${s.type} Â· ${fmtSAR(s.price)}</b> from this employee's history. The action will be logged in the audit trail.`;
    document.getElementById('confirm').classList.add('show');
  }
  function closeConfirm(){ document.getElementById('confirm').classList.remove('show'); _delId = null; }
  document.getElementById('confirm-yes').onclick = ()=>{
    if(!_delId) return;
    const idx = services.findIndex(x=>x.id===_delId);
    if (idx>=0){
      const s = services[idx];
      services.splice(idx,1);
      toast(`Deleted ${s.type}`, 'ok');
      renderAll();
    }
    closeConfirm();
  };

  function openEmpModal(){
    document.getElementById('ef-name').value = '';
    document.getElementById('ef-iqama').value = '';
    document.getElementById('ef-phone').value = '+966 ';
    document.getElementById('ef-dept').value = 'Operations';
    document.getElementById('ef-joined').value = new Date().toISOString().slice(0,10);
    document.getElementById('ef-error').style.display='none';
    document.getElementById('emp-modal').classList.add('show');
    setTimeout(()=>document.getElementById('ef-name').focus(), 50);
  }
  function closeEmpModal(){ document.getElementById('emp-modal').classList.remove('show'); }
  function saveEmp(){
    const n = document.getElementById('ef-name').value.trim();
    const iqama = document.getElementById('ef-iqama').value.trim();
    const phone = document.getElementById('ef-phone').value.trim();
    const dept  = document.getElementById('ef-dept').value;
    const joined= document.getElementById('ef-joined').value;
    const err = document.getElementById('ef-error');
    if (!n)            { err.textContent='Full name is required'; err.style.display='block'; return; }
    if (!iqama)        { err.textContent='Iqama number is required'; err.style.display='block'; return; }
    if (employees.some(e=>e.iqama===iqama)) { err.textContent='An employee with this Iqama already exists'; err.style.display='block'; return; }
    const id = 'E' + (employees.length + 1);
    employees.push({id, n, iqama, phone, dept, joined: joined || new Date().toISOString().slice(0,10)});
    toast('Employee added Â· ' + n, 'ok');
    closeEmpModal();
    renderAll();
    openCase(id);
  }

  function openCase(empId){
    currentEmp = empId;
    renderCase();
    show('employee');
  }

  // ========= STATIC: Heatmap + Top employees =========
  const hm = document.getElementById('heatmap');
  if (hm){
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const types = ['Iqama', 'Insurance', 'Work permit', 'Exit visa', 'GOSI', 'Other'];
    const cells = [];
    cells.push('<div></div>');
    months.forEach(m => cells.push(`<div style="text-align:center; color:var(--muted); padding:4px 0">${m}</div>`));
    types.forEach((t,r)=>{
      cells.push(`<div style="padding:6px 4px; color:var(--muted)">${t}</div>`);
      for(let c=0; c<12; c++){
        const v = ((r*7 + c*3) % 11) / 10;
        const a = 0.10 + v*0.85;
        cells.push(`<div title="${t} Â· ${months[c]}" style="height:22px; border-radius:4px; background:oklch(0.52 0.08 195 / ${a.toFixed(2)})"></div>`);
      }
    });
    hm.innerHTML = cells.join('');
  }

  // Top employees from real data
  const topData = employees.map(e=>{
    const a = empAggregate(e.id);
    return {n:e.n, amt:a.total};
  }).sort((a,b)=>b.amt-a.amt);
  const max = topData[0]?.amt || 1;
  document.getElementById('top-emp').innerHTML = topData.map(t=>`
    <div style="display:flex; padding: 11px 16px; border-bottom: 1px solid var(--line); align-items:center; gap:10px">
      <div class="mini-avatar" style="background:${avColor(t.n)}; width:26px;height:26px; font-size:10.5px">${initials(t.n)}</div>
      <div style="flex:1; min-width:0">
        <div style="font-weight:500; font-size:13px">${t.n}</div>
        <div style="height:4px; background: var(--line); border-radius:2px; margin-top:5px; overflow:hidden">
          <div style="width:${(t.amt/max*100).toFixed(0)}%; height:100%; background: var(--accent)"></div>
        </div>
      </div>
      <div class="num" style="font-weight:500">${fmtSAR(t.amt)}</div>
    </div>`).join('');

  // Initial render
  renderAll();