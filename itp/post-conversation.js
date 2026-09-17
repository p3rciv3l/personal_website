/* Fetch the original conversation only when a reader opens its viewer. */
document.querySelectorAll('.conversation').forEach((viewer) => {
  const trigger = viewer.querySelector('.conversation-trigger');
  const panel = viewer.querySelector('.conversation-panel');
  const frame = viewer.querySelector('iframe');
  let pinned = false;
  let closeTimer;

  function position() {
    const anchor = trigger.getBoundingClientRect();
    const width = panel.offsetWidth;
    const height = panel.offsetHeight;
    panel.style.left = `${Math.max(16, Math.min(anchor.left, innerWidth - width - 16))}px`;
    panel.style.top = `${Math.max(16, Math.min(anchor.bottom + 4, innerHeight - height - 16))}px`;
  }

  function open() {
    clearTimeout(closeTimer);
    panel.hidden = false;
    trigger.setAttribute('aria-expanded', 'true');
    position();
    if (!frame.hasAttribute('src')) frame.src = trigger.href;
  }

  function close() {
    clearTimeout(closeTimer);
    pinned = false;
    panel.hidden = true;
    trigger.setAttribute('aria-expanded', 'false');
  }

  viewer.addEventListener('pointerenter', (event) => {
    if (event.pointerType === 'mouse') open();
  });
  viewer.addEventListener('pointerleave', () => {
    if (!pinned) closeTimer = setTimeout(close, 250);
  });
  viewer.addEventListener('focusin', open);
  viewer.addEventListener('focusout', (event) => {
    if (!viewer.contains(event.relatedTarget)) close();
  });
  trigger.addEventListener('click', (event) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    pinned = true;
    open();
  });
  function dismiss() {
    trigger.focus();
    close();
  }
  panel.querySelector('button').addEventListener('click', dismiss);
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !panel.hidden) dismiss();
  });
  // Keyboard events in the same-origin transcript need their own listener.
  frame.addEventListener('load', () => {
    frame.contentDocument?.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') dismiss();
    });
  });
  document.addEventListener('pointerdown', (event) => {
    if (!viewer.contains(event.target)) close();
  });
  document.querySelector('.post-reveal')?.addEventListener('toggle', (event) => {
    if (!event.target.open) close();
  });
  addEventListener('resize', () => { if (!panel.hidden) position(); });
});
