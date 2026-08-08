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
    li.className = 'pub-item';
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

function projectCardHTML(proj){
  const link = proj.link
    ? `<a class="project-link" href="${escapeHTML(proj.link)}" target="_blank" rel="noopener">View on GitHub →</a>`
    : '';
  return `
    <div class="project-card">
      <div class="project-top">
        <span class="project-type">${escapeHTML(proj.type)}</span>
        <span class="project-year">${escapeHTML(proj.year)}</span>
      </div>
      <div class="project-title">${escapeHTML(proj.title)}</div>
      <p class="project-desc">${escapeHTML(proj.description)}</p>
      <div class="project-tools">
        ${(proj.tools || []).map(t => `<span class="tool-pill">${escapeHTML(t)}</span>`).join('')}
      </div>
      ${link}
    </div>
  `;
}

function renderProjectGrid(targetId, projects, emptyMessage){
  const grid = $(targetId);
  if(!grid) return;
  if(!projects || projects.length === 0){
    grid.innerHTML = `<div class="project-empty">${escapeHTML(emptyMessage || 'More coming soon 🌱')}</div>`;
    return;
  }
  grid.innerHTML = projects.map(projectCardHTML).join('');
}

function renderProjects(projects){
  // projects is an object: { llm: [...], agents: [...], applied: [...] }
  renderProjectGrid('llmProjectGrid', projects.llm, 'LLM projects landing here soon 🧠');
  renderProjectGrid('agentProjectGrid', projects.agents, 'Agentic AI projects landing here soon 🤖');
  renderProjectGrid('appliedProjectGrid', projects.applied, 'More applied work coming soon 🧪');
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
    li.className = 'timeline-item';
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
    div.className = 'skill-group';
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
    <a class="contact-link" href="${escapeHTML(l.href)}" target="_blank" rel="noopener">
      <span class="contact-label">${escapeHTML(l.label)}</span>
      <span class="contact-value">${escapeHTML(l.value)}</span>
    </a>
  `).join('');
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
