/* ============================================================
   ADMIN DASHBOARD — Analytics Engine
   Fetches real visitor data from Google Apps Script endpoint
   ============================================================ */
(function() {
  'use strict';

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // ⚙️ CONFIGURATION — Same URL as in tracker.js
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  var SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxmgwLbFb4JF5dPQ6wio0pUuK2UwffemwPd0SgBaqxx5MfORQzQUHX7EZ83L7s_gNxt/exec'; // <-- PASTE YOUR APPS SCRIPT WEB APP URL HERE

  // ---- Date Helpers ----
  function toDateStr(d) {
    if (typeof d === 'string') d = new Date(d);
    else if (typeof d === 'number') d = new Date(d);
    return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
  }
  function toTimeStr(d) {
    if (typeof d === 'string') d = new Date(d);
    else if (typeof d === 'number') d = new Date(d);
    return String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0')+':'+String(d.getSeconds()).padStart(2,'0');
  }
  function toFullStr(d) { return toDateStr(d)+' '+toTimeStr(d); }
  function getDayName(d) {
    if (typeof d === 'number') d = new Date(d);
    return ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][d.getDay()];
  }
  function getMonthName(m) {
    return ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][m];
  }
  function startOfDay(ts) {
    var d = new Date(ts); d.setHours(0,0,0,0); return d.getTime();
  }
  function getWeekNumber(ts) {
    var d=new Date(ts); d.setHours(0,0,0,0);
    d.setDate(d.getDate()+3-(d.getDay()+6)%7);
    var w1=new Date(d.getFullYear(),0,4);
    return 1+Math.round(((d-w1)/86400000-3+(w1.getDay()+6)%7)/7);
  }

  // Normalize a visit row from sheet data
  function normalizeVisit(row) {
    return {
      ts: new Date(row.timestamp).getTime(),
      page: row.page || 'index.html',
      ref: row.referrer || 'direct',
      sw: parseInt(row.screenWidth) || 0,
      sh: parseInt(row.screenHeight) || 0,
      dev: row.device || 'Unknown',
      br: row.browser || 'Unknown',
      os: row.os || 'Unknown',
      lang: row.language || 'unknown',
      tz: row.timezone || 'unknown'
    };
  }

  // ---- Overview Stats ----
  function calcOverview(visits) {
    var now = Date.now();
    var todayStart = startOfDay(now);
    var weekAgo = now - 7*86400000;
    var monthAgo = now - 30*86400000;

    var today = visits.filter(function(v){return v.ts >= todayStart;}).length;
    var thisWeek = visits.filter(function(v){return v.ts >= weekAgo;}).length;
    var thisMonth = visits.filter(function(v){return v.ts >= monthAgo;}).length;

    // Unique days to calc average
    var daysActive = {};
    visits.forEach(function(v){ daysActive[toDateStr(v.ts)]=true; });
    var numDays = Math.max(Object.keys(daysActive).length,1);
    var avgPerDay = (visits.length/numDays).toFixed(1);

    // Top page
    var pages = {};
    visits.forEach(function(v){ pages[v.page]=(pages[v.page]||0)+1; });
    var topPage = '—'; var topCount = 0;
    Object.keys(pages).forEach(function(p){ if(pages[p]>topCount){topPage=p;topCount=pages[p];} });

    return {
      total:visits.length,
      today:today, thisWeek:thisWeek, thisMonth:thisMonth,
      avgPerDay:avgPerDay, topPage:topPage
    };
  }

  // ---- Daily Data (last 7 days) ----
  function calcDaily(visits) {
    var now = Date.now();
    var days = [];
    for(var i=6;i>=0;i--){
      var dayTs = startOfDay(now - i*86400000);
      var dayEnd = dayTs + 86400000;
      var count = visits.filter(function(v){return v.ts>=dayTs && v.ts<dayEnd;}).length;
      var d = new Date(dayTs);
      days.push({ label:getDayName(d)+' '+d.getDate(), count:count });
    }
    return days;
  }

  // ---- Weekly Data (last 4 weeks) ----
  function calcWeekly(visits) {
    var now = Date.now();
    var weeks = [];
    for(var i=3;i>=0;i--){
      var weekEnd = now - i*7*86400000;
      var weekStart = weekEnd - 7*86400000;
      var count = visits.filter(function(v){return v.ts>=weekStart && v.ts<weekEnd;}).length;
      weeks.push({ label:'W'+getWeekNumber(weekStart), count:count });
    }
    return weeks;
  }

  // ---- Monthly Data (last 6 months) ----
  function calcMonthly(visits) {
    var now = new Date();
    var months = [];
    for(var i=5;i>=0;i--){
      var m = new Date(now.getFullYear(), now.getMonth()-i, 1);
      var mEnd = new Date(now.getFullYear(), now.getMonth()-i+1, 1);
      var count = visits.filter(function(v){return v.ts>=m.getTime() && v.ts<mEnd.getTime();}).length;
      months.push({ label:getMonthName(m.getMonth())+' '+m.getFullYear(), count:count });
    }
    return months;
  }

  // ---- Breakdown helpers ----
  function calcBreakdown(visits, key) {
    var map = {};
    visits.forEach(function(v){ var k=v[key]||'Unknown'; map[k]=(map[k]||0)+1; });
    var arr = Object.keys(map).map(function(k){ return {name:k,count:map[k]}; });
    arr.sort(function(a,b){return b.count-a.count;});
    return arr;
  }

  // ---- Peak Hours ----
  function calcPeakHours(visits) {
    var hours = new Array(24).fill(0);
    visits.forEach(function(v){ hours[new Date(v.ts).getHours()]++; });
    return hours;
  }

  // ---- RENDER FUNCTIONS ----
  function animateCount(el, target) {
    var start=0, dur=800, startTime=null;
    var isFloat = String(target).indexOf('.') > -1;
    var num = parseFloat(target);
    function step(ts) {
      if(!startTime) startTime=ts;
      var p = Math.min((ts-startTime)/dur,1);
      p = 1-Math.pow(1-p,3);
      var val = start+(num-start)*p;
      el.textContent = isFloat ? val.toFixed(1) : Math.floor(val);
      if(p<1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  function renderOverview(stats) {
    var items = [
      {id:'ov-total', val:stats.total, sub:'All time page views'},
      {id:'ov-today', val:stats.today, sub:'Views today'},
      {id:'ov-week', val:stats.thisWeek, sub:'Last 7 days'},
      {id:'ov-month', val:stats.thisMonth, sub:'Last 30 days'},
      {id:'ov-avg', val:stats.avgPerDay, sub:'Avg per day'},
      {id:'ov-top', val:stats.topPage, sub:'Most visited page'}
    ];
    items.forEach(function(item){
      var el = document.getElementById(item.id);
      if(!el) return;
      if(typeof item.val==='string' && isNaN(item.val)) el.textContent = item.val;
      else animateCount(el, item.val);
      var subEl = document.getElementById(item.id+'-sub');
      if(subEl) subEl.textContent = item.sub;
    });
  }

  function renderBarChart(containerId, data, colorClass) {
    var container = document.getElementById(containerId);
    if(!container) return;
    container.innerHTML = '';
    var max = Math.max.apply(null, data.map(function(d){return d.count;})) || 1;
    data.forEach(function(d, i){
      var col = document.createElement('div');
      col.className = 'bar-col';
      var pct = Math.max((d.count/max)*100, 2);
      col.innerHTML =
        '<div class="bar-value">'+d.count+'</div>'+
        '<div class="bar '+colorClass+'" style="height:'+pct+'%;animation-delay:'+(i*0.08)+'s"></div>'+
        '<div class="bar-label">'+d.label+'</div>';
      container.appendChild(col);
    });
  }

  var COLORS = ['#00f5ff','#ff006e','#80ff44','#ffd700','#a855f7','#38bdf8','#f97316','#ec4899'];
  function renderBreakdown(containerId, data) {
    var container = document.getElementById(containerId);
    if(!container) return;
    container.innerHTML = '';
    var total = data.reduce(function(s,d){return s+d.count;},0) || 1;
    data.slice(0,8).forEach(function(d,i){
      var li = document.createElement('li');
      var pct = ((d.count/total)*100).toFixed(1);
      li.innerHTML =
        '<span class="bd-dot" style="background:'+COLORS[i%COLORS.length]+'"></span>'+
        '<span class="bd-name">'+d.name+'</span>'+
        '<span class="bd-count">'+d.count+'</span>'+
        '<span class="bd-pct">'+pct+'%</span>';
      container.appendChild(li);
    });
    if(data.length === 0) {
      container.innerHTML = '<li style="color:var(--muted);padding:12px 0">No data yet</li>';
    }
  }

  function renderHeatmap(containerId, hours) {
    var container = document.getElementById(containerId);
    if(!container) return;
    container.innerHTML = '';
    var max = Math.max.apply(null, hours) || 1;
    hours.forEach(function(count, h){
      var cell = document.createElement('div');
      cell.className = 'hm-cell';
      var intensity = count/max;
      if(intensity>0.7) cell.style.background='rgba(0,245,255,0.6)';
      else if(intensity>0.4) cell.style.background='rgba(0,245,255,0.35)';
      else if(intensity>0.15) cell.style.background='rgba(0,245,255,0.18)';
      else if(count>0) cell.style.background='rgba(0,245,255,0.08)';
      cell.style.boxShadow = count>0 ? '0 0 '+(intensity*12)+'px rgba(0,245,255,'+(intensity*0.4)+')' : 'none';
      cell.setAttribute('data-tooltip', String(h).padStart(2,'0')+':00 — '+count+' visits');
      container.appendChild(cell);
    });
    var labels = document.getElementById(containerId+'-labels');
    if(labels){
      labels.innerHTML='';
      for(var h=0;h<24;h++){
        var lbl = document.createElement('div');
        lbl.className='hm-label';
        lbl.textContent = String(h).padStart(2,'0');
        labels.appendChild(lbl);
      }
    }
  }

  function renderLog(visits) {
    var tbody = document.getElementById('log-tbody');
    if(!tbody) return;
    tbody.innerHTML = '';
    var recent = visits.slice(-50).reverse();
    if(recent.length===0){
      tbody.innerHTML='<tr><td colspan="7" style="text-align:center;color:var(--muted);padding:24px">No visitor data yet. Make sure your tracker.js SCRIPT_URL is configured.</td></tr>';
      return;
    }
    recent.forEach(function(v){
      var tr = document.createElement('tr');
      var ref = v.ref||'direct';
      if(ref.length>30) ref=ref.substring(0,30)+'…';
      tr.innerHTML =
        '<td>'+toFullStr(v.ts)+'</td>'+
        '<td class="page-cell">'+v.page+'</td>'+
        '<td class="ref-cell" title="'+(v.ref||'direct')+'">'+ref+'</td>'+
        '<td class="dev-cell">'+v.dev+'</td>'+
        '<td class="br-cell">'+v.br+'</td>'+
        '<td>'+v.os+'</td>'+
        '<td>'+(v.sw||'?')+'×'+(v.sh||'?')+'</td>';
      tbody.appendChild(tr);
    });
  }

  // ---- TABS ----
  function initTabs() {
    var btns = document.querySelectorAll('.tab-btn');
    btns.forEach(function(btn){
      btn.addEventListener('click', function(){
        btns.forEach(function(b){b.classList.remove('active');});
        btn.classList.add('active');
        var target = btn.getAttribute('data-tab');
        document.querySelectorAll('.tab-content').forEach(function(tc){
          tc.style.display = tc.id===target ? 'block' : 'none';
        });
      });
    });
  }

  // ---- LOADING STATE ----
  function showLoading() {
    var el = document.getElementById('loading-state');
    if(el) el.style.display = 'flex';
  }
  function hideLoading() {
    var el = document.getElementById('loading-state');
    if(el) el.style.display = 'none';
  }

  // ---- FETCH DATA FROM GOOGLE SHEETS ----
  function fetchVisitorData(callback) {
    if (!SCRIPT_URL) {
      hideLoading();
      var tbody = document.getElementById('log-tbody');
      if(tbody) tbody.innerHTML='<tr><td colspan="7" style="text-align:center;color:var(--pink);padding:24px">⚠️ SCRIPT_URL not configured. Edit js/admin.js and js/tracker.js to add your Google Apps Script URL.</td></tr>';
      return;
    }

    showLoading();
    fetch(SCRIPT_URL + '?action=getAll')
      .then(function(res){ return res.json(); })
      .then(function(data){
        hideLoading();
        if (data && data.visits && Array.isArray(data.visits)) {
          var visits = data.visits.map(normalizeVisit);
          visits.sort(function(a,b){return a.ts-b.ts;});
          callback(visits);
        } else {
          callback([]);
        }
      })
      .catch(function(err){
        hideLoading();
        console.error('Failed to fetch analytics:', err);
        var tbody = document.getElementById('log-tbody');
        if(tbody) tbody.innerHTML='<tr><td colspan="7" style="text-align:center;color:var(--pink);padding:24px">❌ Failed to load data. Check your Apps Script URL and deployment.</td></tr>';
        callback([]);
      });
  }

  // ---- CLEAR DATA ----
  window.clearAnalyticsData = function() {
    if(!SCRIPT_URL) { alert('SCRIPT_URL not configured.'); return; }
    if(!confirm('Are you sure you want to clear ALL analytics data? This cannot be undone.')) return;
    fetch(SCRIPT_URL + '?action=clear')
      .then(function(){ location.reload(); })
      .catch(function(err){ alert('Failed to clear: ' + err.message); });
  };

  // ---- MASTER RENDER ----
  function renderAll(visits) {
    var stats = calcOverview(visits);
    renderOverview(stats);
    renderBarChart('chart-daily', calcDaily(visits), 'cyan');
    renderBarChart('chart-weekly', calcWeekly(visits), 'pink');
    renderBarChart('chart-monthly', calcMonthly(visits), 'lime');
    renderBreakdown('bd-device', calcBreakdown(visits, 'dev'));
    renderBreakdown('bd-browser', calcBreakdown(visits, 'br'));
    renderBreakdown('bd-os', calcBreakdown(visits, 'os'));
    renderHeatmap('heatmap', calcPeakHours(visits));
    renderLog(visits);
    var tsEl = document.getElementById('last-updated');
    if(tsEl) tsEl.textContent = 'Last updated: '+toFullStr(Date.now());
    // Update total count in topbar
    var countEl = document.getElementById('total-visitors-count');
    if(countEl) countEl.textContent = visits.length;
  }

  // ---- REFRESH ----
  window.refreshDashboard = function() {
    fetchVisitorData(renderAll);
  };

  // ---- INIT ----
  document.addEventListener('DOMContentLoaded', function(){
    initTabs();
    fetchVisitorData(renderAll);
  });

})();
