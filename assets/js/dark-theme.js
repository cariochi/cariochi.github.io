(function () {
    const KEY = 'theme'; // 'dark' | 'light' | null=system
    const el = document.documentElement;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const radios = document.querySelectorAll('.theme-switcher input[name="theme"]');

    // застосувати збережене
    const saved = localStorage.getItem(KEY);
    if (saved === 'dark' || saved === 'light') {
        el.setAttribute('data-theme', saved);
        document.querySelector(`.theme-switcher input[value="${saved}"]`).checked = true;
    } else {
        el.removeAttribute('data-theme');
        document.querySelector(`.theme-switcher input[value="system"]`).checked = true;
    }

    // слухати клік
    radios.forEach(r => r.addEventListener('change', () => {
        if (r.value === 'light') {
            el.setAttribute('data-theme', 'light');
            localStorage.setItem(KEY, 'light');
        } else if (r.value === 'dark') {
            el.setAttribute('data-theme', 'dark');
            localStorage.setItem(KEY, 'dark');
        } else {
            el.removeAttribute('data-theme');
            localStorage.removeItem(KEY);
        }
    }));

    // реагувати на зміну системної теми
    mq.addEventListener?.('change', () => {
        if (!localStorage.getItem(KEY)) {
            // оновлювати вигляд автоматично
            document.querySelector(`.theme-switcher input[value="system"]`).checked = true;
        }
    });
})();
