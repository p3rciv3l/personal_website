(() => {
  const collages = [...document.querySelectorAll('.collage')];
  const title = document.querySelector('h1');
  const photos = [...document.querySelectorAll('.photo')];
  let titleFrame;
  function updateTitle() {
    titleFrame = null;
    const heading = title.getBoundingClientRect();
    title.classList.toggle('over-image', photos.some(photo => {
      const rect = photo.getBoundingClientRect();
      return rect.left < heading.right && rect.right > heading.left && rect.top < heading.bottom && rect.bottom > heading.top;
    }));
  }
  function scheduleTitle() {
    if (titleFrame == null) titleFrame = requestAnimationFrame(updateTitle);
  }
  window.addEventListener('scroll', scheduleTitle, { passive: true });
  // Every composition is represented as height = m * width + b.
  // Accounting for the gutters keeps every image uncropped and every gap identical.
  function measure(node, gap) {
    if (node.classList.contains('photo')) {
      const isLead = node.getAttribute('href') === '/itp/media/ambition/3-5.jpeg';
      return { node, m: isLead ? 1 : +node.dataset.height / +node.dataset.width, b: 0 };
    }
    const children = [...node.children].map(child => measure(child, gap));
    const axis = node.dataset.axis;
    if (axis === 'column') return { node, children, axis, m: children.reduce((s, c) => s + c.m, 0), b: children.reduce((s, c) => s + c.b, 0) + gap * (children.length - 1) };
    const inverse = children.reduce((s, c) => s + 1 / c.m, 0);
    return { node, children, axis, m: 1 / inverse, b: (children.reduce((s, c) => s + c.b / c.m, 0) - gap * (children.length - 1)) / inverse };
  }
  function place(tree, x, y, width, gap) {
    const height = tree.m * width + tree.b;
    if (!tree.children) {
      Object.assign(tree.node.style, { left: `${x}px`, top: `${y}px`, width: `${width}px` });
    } else {
      for (const child of tree.children) {
        const childWidth = tree.axis === 'row' ? (height - child.b) / child.m : width;
        const childHeight = place(child, x, y, childWidth, gap);
        if (tree.axis === 'row') x += childWidth + gap;
        else y += childHeight + gap;
      }
    }
    return height;
  }
  function layout() {
    const gap = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--gap'));
    for (const section of collages) {
      const width = section.clientWidth;
      const tree = measure(section.firstElementChild, gap);
      let height;
      if (width < 560 && section === collages.at(-1)) {
        const leaves = [...section.querySelectorAll('.photo')].map(n => measure(n, gap));
        height = place(leaves[0], 0, 0, width, gap);
        for (const row of [leaves.slice(1, 3), leaves.slice(3)]) {
          const rowHeight = (width - gap * (row.length - 1)) / row.reduce((sum, leaf) => sum + 1 / leaf.m, 0);
          height += gap;
          let x = 0;
          for (const leaf of row) {
            const w = rowHeight / leaf.m;
            place(leaf, x, height, w, gap);
            x += w + gap;
          }
          height += rowHeight;
        }
      } else height = place(tree, 0, 0, width, gap);
      section.style.height = `${height}px`;
      section.classList.add('laid-out');
    }
    scheduleTitle();
  }
  layout();
  new ResizeObserver(layout).observe(document.querySelector('main'));
  const viewer = document.querySelector('.viewer');
  const expanded = viewer.querySelector('img');
  const status = viewer.querySelector('.viewer-status');
  let trigger;
  let currentIndex = 0;
  function showImage(index) {
    currentIndex = (index + photos.length) % photos.length;
    const img = photos[currentIndex].querySelector('img');
    expanded.src = img.currentSrc || img.src;
    expanded.alt = img.alt;
    status.textContent = `${currentIndex + 1} of ${photos.length}: ${img.alt}`;
    for (const offset of [-1, 1]) {
      photos[(currentIndex + offset + photos.length) % photos.length].querySelector('img').decode?.().catch(() => {});
    }
  }
  const close = () => viewer.close();
  photos.forEach((link, index) => {
    const img = link.querySelector('img');
    // Eager HTML loads + preload hints fetch the exact same full-resolution URL.
    // Decode on intent so opening never waits for a second, larger download.
    const warm = () => { img.decode?.().catch(() => {}); };
    link.addEventListener('pointerenter', warm);
    link.addEventListener('focus', warm);
    link.addEventListener('click', event => {
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      trigger = link;
      showImage(index);
      viewer.showModal();
    });
  });
  viewer.querySelector('.close').addEventListener('click', close);
  viewer.querySelector('.previous').addEventListener('click', () => showImage(currentIndex - 1));
  viewer.querySelector('.next').addEventListener('click', () => showImage(currentIndex + 1));
  viewer.addEventListener('keydown', event => {
    if (!viewer.open || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      showImage(currentIndex + (event.key === 'ArrowLeft' ? -1 : 1));
    }
  });
  viewer.addEventListener('click', event => { if (event.target === viewer) close(); });
  viewer.addEventListener('close', () => { expanded.removeAttribute('src'); trigger?.focus({ preventScroll: true }); });
})();
