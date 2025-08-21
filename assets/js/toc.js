document.addEventListener("DOMContentLoaded", function () {
  const tocLinks = document.querySelectorAll(".toc a");
  const headings = Array.from(tocLinks).map(link => {
    const id = link.getAttribute("href").slice(1);
    return document.getElementById(id);
  });

  function onScroll() {
    let current = null;

    for (let i = 0; i < headings.length; i++) {
      const h = headings[i];
      if (h && h.getBoundingClientRect().top <= 140) {
        current = tocLinks[i];
      }
    }

    tocLinks.forEach(link => link.classList.remove("active"));
    if (current) {
      current.classList.add("active");
    }
  }

  document.addEventListener("scroll", onScroll, {passive: true});
  onScroll();
});
