(function () {
  function addCopyButtons(scope = document) {
    // Rouge рендерить блоки як <div class="highlight"> ... або <figure class="highlight"> ...
    const wrappers = scope.querySelectorAll('div.highlight, figure.highlight');
    wrappers.forEach((wrapper) => {
      if (wrapper.querySelector('.copy-btn')) {
        return;
      } // не дублюємо

      const btn = document.createElement('button');
      btn.className = 'copy-btn';
      btn.type = 'button';
      btn.setAttribute('aria-label', 'Copy code');
      btn.innerHTML = '&nbsp;&nbsp;Copy&nbsp;';

      btn.addEventListener('click', () => {
        // Якщо ввімкнені line numbers, Rouge загортає код у таблицю:
        // <table class="rouge-table"><td class="rouge-code"><pre><code>...</code></pre></td>
        const codeCell = wrapper.querySelector('td.rouge-code');
        const codeEl = codeCell
            ? (codeCell.querySelector('pre code') || codeCell.querySelector('code, pre'))
            : (wrapper.querySelector('pre code') || wrapper.querySelector('code, pre'));
        if (!codeEl) {
          return;
        }

        const text = codeEl.innerText;

        const onCopied = () => {
          const prev = btn.innerHTML;
          btn.innerHTML = 'Copied';
          btn.classList.add('copied');
          setTimeout(() => {
            btn.innerHTML = prev;
            btn.classList.remove('copied');
          }, 1200);
        };

        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(text).then(onCopied).catch(() => fallbackCopy(text, onCopied));
        } else {
          fallbackCopy(text, onCopied);
        }
      });

      // позиціонуємо відносно контейнера
      const style = getComputedStyle(wrapper);
      if (style.position === 'static') {
        wrapper.style.position = 'relative';
      }

      wrapper.appendChild(btn);
    });
  }

  function fallbackCopy(text, done) {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.top = '-9999px';
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand('copy');
    } catch (e) {
    }
    document.body.removeChild(ta);
    if (typeof done === 'function') {
      done();
    }
  }

  // Ініціалізація
  document.addEventListener('DOMContentLoaded', () => addCopyButtons());

  // Якщо використовуєш Ajax/PJAX і контент підмінюється динамічно — перевішай тут свою подію
  document.addEventListener('pjax:complete', (e) => addCopyButtons(e.target || document));
})();
