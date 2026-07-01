/* ==========================================================
   Renders the entire portfolio from data.json.
   To add/remove a project or publication: edit data.json only.
   ========================================================== */

const $ = (id) => document.getElementById(id);

function escapeHTML(str){
  if(!str) return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

async function loadData(){
  const res = await fetch('data.json');
  if(!res.ok) throw new Error('Could not load data.json');
  return res.json();
}

function renderHero(profile){
  $('heroName').textContent = profile.name;
  $('heroTagline').textContent = profile.tagline;
  $('heroLocation').textContent = '📍 ' + profile.location;
  $('heroCV').href = profile.cvFile || '#';
  if(profile.cvFile){ $('heroCV').setAttribute('download', profile.cvFile); }
  document.title = `${profile.name} | Research Portfolio`;

  if(profile.goal){
    $('heroGoal').innerHTML = `<b>🎯 The goal:</b> ${escapeHTML(profile.goal)}`;
  }

  if(Array.isArray(profile.vibes)){
    $('heroVibes').innerHTML = profile.vibes
      .map(v => `<span class="vibe-chip">${escapeHTML(v)}</span>`)
      .join('');
  }
}

function renderSummary(profile){
  $('summaryText').textContent = profile.summary;
}

function renderPublications(publications){
  const list = $('pubList');
  list.innerHTML = '';
  publications.forEach((pub, i) => {
    const li = document.createElement('li');
    li.className = 'pub-item reveal';
    li.innerHTML = `
      <span class="pub-index">${String(i+1).padStart(2,'0')}</span>
      <div class="pub-body">
        <a class="pub-title" href="${escapeHTML(pub.doi)}" target="_blank" rel="noopener">${escapeHTML(pub.title)}</a>
        <div class="pub-authors">${escapeHTML(pub.authors)} · ${escapeHTML(pub.venue)}</div>
        <div class="pub-desc">${escapeHTML(pub.description)}</div>
      </div>
      <div class="pub-meta">
        <span class="pub-status">${escapeHTML(pub.status)}</span>
        <span class="pub-year">${escapeHTML(pub.year)}</span>
      </div>
    `;
    list.appendChild(li);
  });
}

function renderProjects(projects){
  const grid = $('projectGrid');
  grid.innerHTML = '';
  projects.forEach(proj => {
    const card = document.createElement('div');
    card.className = 'project-card reveal';
    card.innerHTML = `
      <div class="project-top">
        <span class="project-type">${escapeHTML(proj.type)}</span>
        <span class="project-year">${escapeHTML(proj.year)}</span>
      </div>
      <div class="project-title">${escapeHTML(proj.title)}</div>
      <p class="project-desc">${escapeHTML(proj.description)}</p>
      <div class="project-tools">
        ${(proj.tools || []).map(t => `<span class="tool-pill">${escapeHTML(t)}</span>`).join('')}
      </div>
    `;
    grid.appendChild(card);
  });
}

function renderProjectsSub(profile){
  const el = $('projectsSub');
  if(!el) return;
  const base = 'Applied and academic work: a mix of coursework, internships, and things built out of curiosity.';
  if(profile.github){
    el.innerHTML = `${base} Every project here, plus the full code, lives on <a href="${escapeHTML(profile.github)}" target="_blank" rel="noopener" class="inline-link">GitHub</a>.`;
  } else {
    el.textContent = base;
  }
}

function renderTimeline(targetId, items, isExperience){
  const el = $(targetId);
  el.innerHTML = '';
  items.forEach(item => {
    const li = document.createElement('li');
    li.className = 'timeline-item reveal';
    if(isExperience){
      li.innerHTML = `
        <div class="timeline-role">${escapeHTML(item.role)}</div>
        <div class="timeline-org">${escapeHTML(item.org)} · ${escapeHTML(item.location)}</div>
        <div class="timeline-period">${escapeHTML(item.period)}</div>
        <div class="timeline-desc">${escapeHTML(item.description)}</div>
      `;
    } else {
      li.innerHTML = `
        <div class="timeline-role">${escapeHTML(item.degree)}</div>
        <div class="timeline-org">${escapeHTML(item.institution)} · ${escapeHTML(item.location)}</div>
        <div class="timeline-period">${escapeHTML(item.period)}</div>
        <div class="timeline-desc">${escapeHTML(item.detail)}</div>
      `;
    }
    el.appendChild(li);
  });
}

function renderSkills(skills){
  const grid = $('skillsGrid');
  grid.innerHTML = '';
  Object.entries(skills).forEach(([group, tags]) => {
    const div = document.createElement('div');
    div.className = 'skill-group reveal';
    div.innerHTML = `
      <div class="skill-group-title">${escapeHTML(group)}</div>
      <div class="skill-tags">
        ${tags.map(t => `<span class="skill-tag">${escapeHTML(t)}</span>`).join('')}
      </div>
    `;
    grid.appendChild(div);
  });
}

function renderContact(profile){
  const grid = $('contactGrid');
  const links = [
    { label:'Email', value: profile.email, href:`mailto:${profile.email}` },
    { label:'Phone', value: profile.phone, href:`tel:${profile.phone.replace(/\s+/g,'')}` },
    { label:'LinkedIn', value:'View profile', href: profile.linkedin },
    { label:'GitHub', value:'View profile', href: profile.github },
  ].filter(l => l.value);
  grid.innerHTML = links.map(l => `
    <a class="contact-link reveal" href="${escapeHTML(l.href)}" target="_blank" rel="noopener">
      <span class="contact-label">${escapeHTML(l.label)}</span>
      <span class="contact-value">${escapeHTML(l.value)}</span>
    </a>
  `).join('');
}

/* ---------- Ambient layer: soft glow blobs + a few drifting stickers ---------- */
function initAmbientLayer(){
  const layer = $('ambientLayer');
  if(!layer) return;
  const blobColors = ['#E2EADA', '#F4E1D2', '#F5E9D0'];

  // soft, blurry glows tucked toward the edges — calm, not busy
  const blobSpots = [
    {top:'8%',  left:'3%'},  {top:'68%', left:'1%'},
    {top:'14%', left:'90%'}, {top:'80%', left:'86%'}
  ];
  blobSpots.forEach((spot, i) => {
    const size = 130 + Math.random() * 160;
    const el = document.createElement('div');
    el.className = 'float-blob';
    el.style.width = size + 'px';
    el.style.height = size + 'px';
    el.style.top = spot.top;
    el.style.left = spot.left;
    el.style.background = blobColors[i % blobColors.length];
    el.style.animationDelay = (i * 1.4) + 's';
    el.style.animationDuration = (14 + i * 2) + 's';
    layer.appendChild(el);
  });

  // a handful of tiny drifting stickers — sparing, so it stays relaxed
  const stickers = ['🌿','✨','☕','🍂','⭐'];
  const spots = [
    {top:'12%', left:'8%'}, {top:'55%', left:'4%'}, {top:'30%', left:'94%'},
    {top:'78%', left:'92%'}, {top:'92%', left:'12%'}
  ];
  spots.forEach((spot, i) => {
    const el = document.createElement('div');
    el.className = 'float-mote';
    el.style.top = spot.top;
    el.style.left = spot.left;
    el.style.fontSize = (14 + Math.random() * 6) + 'px';
    el.style.opacity = '0.5';
    el.textContent = stickers[i % stickers.length];
    el.style.animationDelay = (Math.random() * 4) + 's';
    el.style.animationDuration = (10 + Math.random() * 6) + 's';
    layer.appendChild(el);
  });
}

/* ---------- Confetti burst ---------- */
function burstConfetti(originX, originY){
  const colors = ['#8FA888', '#D99A78', '#DCB36C', '#C9C0B2'];
  const count = 26;
  for(let i = 0; i < count; i++){
    const piece = document.createElement('div');
    piece.className = 'confetti-piece';
    const size = 5 + Math.random() * 5;
    piece.style.width = size + 'px';
    piece.style.height = (size * 0.5) + 'px';
    piece.style.background = colors[i % colors.length];
    piece.style.left = originX + 'px';
    piece.style.top = originY + 'px';
    document.body.appendChild(piece);

    const angle = Math.random() * Math.PI * 2;
    const dist = 60 + Math.random() * 140;
    const dx = Math.cos(angle) * dist;
    const dy = Math.sin(angle) * dist - 40;
    const rot = Math.random() * 720 - 360;

    piece.animate([
      { transform: 'translate(0,0) rotate(0deg)', opacity: 1 },
      { transform: `translate(${dx}px, ${dy + 220}px) rotate(${rot}deg)`, opacity: 0 }
    ], {
      duration: 900 + Math.random() * 500,
      easing: 'cubic-bezier(.2,.7,.3,1)'
    }).onfinish = () => piece.remove();
  }
}

/* ---------- Floating mascot companion ---------- */
function initMascotWidget(){
  const widget = $('mascotWidget');
  const bubble = $('mascotBubble');
  if(!widget || !bubble) return;

  const messages = [
    'Hi! Thanks for stopping by 🎓',
    'Fun fact: I really like SHAP plots ☺️',
    'Currently PhD-hunting, got a lab? 👀',
    'Interpretable ML is my happy place 🧩',
    'Coffee first, gradients second ☕',
    'Scroll on, there is more to see ✨'
  ];
  let msgIndex = 0;
  let hideTimer = null;

  widget.addEventListener('click', (e) => {
    bubble.textContent = messages[msgIndex % messages.length];
    msgIndex++;
    bubble.classList.add('show');
    clearTimeout(hideTimer);
    hideTimer = setTimeout(() => bubble.classList.remove('show'), 3200);

    const rect = widget.getBoundingClientRect();
    burstConfetti(rect.left + rect.width / 2, rect.top + rect.height / 2);
  });
}

/* ---------- Scroll reveal ---------- */
function initScrollReveal(){
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if(entry.isIntersecting){
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
}

/* ---------- Init ---------- */
async function init(){
  try{
    const data = await loadData();
    renderHero(data.profile);
    renderSummary(data.profile);
    renderPublications(data.publications);
    renderProjects(data.projects);
    renderProjectsSub(data.profile);
    renderTimeline('expList', data.experience, true);
    renderTimeline('eduList', data.education, false);
    renderSkills(data.skills);
    renderContact(data.profile);
    initScrollReveal();
    initAmbientLayer();
    initMascotWidget();

    $('heroCV').addEventListener('click', (e) => {
      const rect = e.currentTarget.getBoundingClientRect();
      burstConfetti(rect.left + rect.width / 2, rect.top + rect.height / 2);
    });
  } catch(err){
    console.error(err);
    document.body.innerHTML = `<div style="padding:60px;font-family:sans-serif;">
      Could not load <code>data.json</code>. If you opened this file directly from your
      computer, your browser may be blocking local file reads. Try running a tiny local
      server (see README) or upload the folder to a host like GitHub Pages.
    </div>`;
  }
  $('year').textContent = new Date().getFullYear();
}

init();