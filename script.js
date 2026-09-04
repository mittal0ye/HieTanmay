/* HieTanmay — shared behaviour (loaded on every page) */
(function () {
  var y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();

  // "Work" nav dropdown (click toggle + hover via CSS; Escape / outside-click close)
  (function () {
    var dd = document.querySelector('.dropdown');
    if (!dd) return;
    var btn = dd.querySelector('.dropbtn');
    function close() { dd.classList.remove('open'); btn.setAttribute('aria-expanded', 'false'); }
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      var open = dd.classList.toggle('open');
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    document.addEventListener('click', function (e) { if (!dd.contains(e.target)) close(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
  })();

  // Motion-Driven scroll reveal (respects prefers-reduced-motion)
  (function () {
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var targets = document.querySelectorAll('.section-head, .group, .spotlight-card, .chips, .social-links');
    if (reduce || !('IntersectionObserver' in window)) {
      targets.forEach(function (el) { el.classList.add('is-visible'); });
      return;
    }
    targets.forEach(function (el) { el.classList.add('reveal'); });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('is-visible'); io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    targets.forEach(function (el) { io.observe(el); });
  })();

  // Inline players (expand on click) + YouTube thumbnails
  (function () {
    function parse(href) {
      if (!href) return null;
      var m = href.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([\w-]{11})/);
      if (m) return { type: 'yt', id: m[1], embed: 'https://www.youtube.com/embed/' + m[1] + '?rel=0&autoplay=1' };
      m = href.match(/open\.spotify\.com\/track\/([A-Za-z0-9]+)/);
      if (m) return { type: 'sp', id: m[1], embed: 'https://open.spotify.com/embed/track/' + m[1] };
      return null;
    }
    document.querySelectorAll('.track-list li').forEach(function (li) {
      var a = li.querySelector('a[href]');
      if (!a) return;
      var info = parse(a.getAttribute('href'));
      if (!info) return; // non-embeddable (Instagram, channels) stay as external links

      if (info.type === 'yt') {
        var img = document.createElement('img');
        img.className = 'thumb'; img.loading = 'lazy'; img.alt = '';
        img.src = 'https://i.ytimg.com/vi/' + info.id + '/mqdefault.jpg';
        a.insertBefore(img, a.firstChild);
      }
      li.classList.add('has-player');
      a.setAttribute('role', 'button');

      a.addEventListener('click', function (e) {
        e.preventDefault();
        var open = li.nextElementSibling;
        if (open && open.classList.contains('player-row')) { open.remove(); li.classList.remove('open'); return; }
        document.querySelectorAll('.track-list li.player-row').forEach(function (p) {
          if (p.previousElementSibling) p.previousElementSibling.classList.remove('open');
          p.remove();
        });
        var row = document.createElement('li');
        row.className = 'player-row';
        row.innerHTML = info.type === 'yt'
          ? '<div class="pl pl-yt"><iframe src="' + info.embed + '" title="Video player" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe></div>'
          : '<div class="pl pl-sp"><iframe src="' + info.embed + '" title="Spotify player" loading="lazy" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" allowfullscreen></iframe></div>';
        li.after(row);
        li.classList.add('open');
      });
    });
  })();

  // Formspree lead form (AJAX submit, no page reload) — only on pages that have the form
  (function () {
    var form = document.getElementById('lead-form');
    if (!form) return;
    var status = document.getElementById('form-status');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      status.textContent = 'Sending…'; status.className = 'form-status';
      fetch(form.action, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } })
        .then(function (r) {
          if (r.ok) { form.reset(); status.textContent = 'Thanks — your message is on its way. I’ll get back to you soon.'; status.className = 'form-status ok'; }
          else { status.textContent = 'Something went wrong. Please email tanmaythakur01@gmail.com.'; status.className = 'form-status err'; }
        })
        .catch(function () { status.textContent = 'Network error. Please email tanmaythakur01@gmail.com.'; status.className = 'form-status err'; });
    });
  })();
})();
