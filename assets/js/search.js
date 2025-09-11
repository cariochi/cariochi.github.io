// /assets/js/search.js
document.addEventListener('DOMContentLoaded', async () => {
    const input = document.getElementById('search-input');
    const out = document.getElementById('search-results');
    if (!input || !out) return;
    if (typeof lunr === 'undefined') return;

    const escapeHtml = s =>
        String(s ?? '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');

    const escapeReg = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    const splitTerms = q =>
        String(q || '')
            .trim()
            .toLowerCase()
            .split(/[\s\-_.:/]+/)
            .filter(Boolean);

    // --- NEW: повне очищення тексту від <tags> та &lt;tags&gt;
    const cleanText = s => String(s || '')
        .replace(/<[^>]*>/g, ' ')        // прибрати HTML-теги
        .replace(/&lt;[^&]*?&gt;/g, ' ')  // прибрати "псевдо" теги з код-блоків
        .replace(/\s+/g, ' ')            // стиснути пробіли
        .trim();

    const highlight = (text, terms) => {
        if (!terms.length) return escapeHtml(text);
        const re = new RegExp(`(${terms.map(escapeReg).join('|')})`, 'gi');
        return escapeHtml(text).replace(re, '<mark>$1</mark>');
    };

    const makeSnippet = (text, terms, max = 180) => {
        const t = cleanText(text);       // ← працюємо з очищеним текстом
        const lc = t.toLowerCase();

        let pos = -1;
        for (const trm of terms) {
            const p = lc.indexOf(trm);
            if (p !== -1 && (pos === -1 || p < pos)) pos = p;
        }

        if (pos === -1) {
            const cut = t.slice(0, max);
            return escapeHtml(cut) + (t.length > max ? '…' : '');
        }

        const start = Math.max(0, pos - Math.floor(max / 2));
        const end = Math.min(t.length, start + max);
        let slice = t.slice(start, end);
        if (start > 0) slice = slice.replace(/^[^\s]+/, '…');
        if (end < t.length) slice = slice.replace(/[^\s]+$/, '') + '…';
        return highlight(slice, terms);
    };

    try {
        const res = await fetch('/search.json', {cache: 'no-store'});
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const rawDocs = await res.json();

        // --- NEW: створюємо "чисті" документи для індексу та відображення
        const docs = rawDocs.map(d => ({
            ...d,
            title: cleanText(d.title),
            content: cleanText(d.content)
        }));

        const idx = lunr(function () {
            this.ref('url');
            this.field('title', {boost: 10});
            this.field('content', {boost: 1});
            this.pipeline.remove(lunr.stemmer);
            this.pipeline.remove(lunr.stopWordFilter);
            docs.forEach(d => this.add(d), this);
        });

        const byUrl = new Map(docs.map(d => [d.url, d]));

        const doSearch = (query) => {
            const terms = splitTerms(query);
            if (!terms.length) {
                out.innerHTML = '';
                out.classList.remove('active');
                return;
            }

            let results = [];
            try {
                results = idx.query(b => {
                    for (const t of terms) {
                        b.term(t, {usePipeline: true, wildcard: lunr.Query.wildcard.TRAILING});
                        b.term(t, {editDistance: 1}); // фуззі
                    }
                });
            } catch {
                results = [];
            }

            const seen = new Set();
            const top = [];
            for (const r of results) {
                if (!seen.has(r.ref)) {
                    seen.add(r.ref);
                    top.push(r);
                }
                if (top.length >= 10) break;
            }

            out.innerHTML = top.map(r => {
                const d = byUrl.get(r.ref) || {};
                const url = d.url || r.ref;
                const title = d.title || url;
                const content = d.content || '';

                return `
          <div class="search-hit" style="padding:.6rem 0;border-bottom:1px solid #eee">
            <a href="${escapeHtml(url)}">
              <span>${highlight(title, terms)}</span>
            </a>
            <div style="opacity:.85;margin-top:.25rem">
              ${makeSnippet(content, terms)}
            </div>
          </div>`;
            }).join('') || '<div>Nothing found.</div>';

            out.classList.add('active');
        };

        input.addEventListener('input', e => doSearch(e.target.value));

        // ESC → закрити
        input.addEventListener('keydown', e => {
            if (e.key === 'Escape') {
                out.classList.remove('active');
                out.innerHTML = '';
                input.blur();
            }
        });

        // клік поза пошуком → закрити
        document.addEventListener('click', e => {
            if (!out.contains(e.target) && e.target !== input) {
                out.classList.remove('active');
            }
            if (out.contains(e.target)) {
                localStorage.setItem('searchQuery', input.value.trim());
            }
        });


        // при фокусі показати результати, якщо є текст
        input.addEventListener('focus', e => {
            if (e.target.value.trim()) {
                doSearch(e.target.value);
            }
        });

        // при втраті фокуса ховаємо результати
        input.addEventListener('blur', () => {
            setTimeout(() => {
                out.classList.remove('active');
            }, 200);
        });

        input.value = localStorage.getItem('searchQuery');
        localStorage.removeItem('searchQuery');

    } catch (err) {
        console.error('[search] init failed:', err);
        out.innerHTML = '<div style="color:#c00">Search init failed</div>';
    }
});
