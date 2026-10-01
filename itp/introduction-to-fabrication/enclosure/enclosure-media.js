/* Load only upcoming media; play only visible, silent clips. */
document.addEventListener('DOMContentLoaded', () => {
  const videos = [...document.querySelectorAll('.itp-post video')];
  const visible = new Set();
  const sync = video => {
    if (document.visibilityState === 'visible' && visible.has(video)) {
      video.muted = true;
      if (video.paused) video.play().catch(() => {});
    } else if (!video.paused) video.pause();
  };
  const prepare = video => {
    if (video.dataset.poster) { video.poster = video.dataset.poster; delete video.dataset.poster; }
    if (video.dataset.src) {
      video.src = video.dataset.src;
      delete video.dataset.src;
      video.preload = 'auto';
      video.load();
    }
  };
  const warm = new IntersectionObserver(entries => {
    for (const entry of entries) if (entry.isIntersecting) {
      const media = entry.target;
      if (media.tagName === 'VIDEO') prepare(media);
      else media.loading = 'eager';
      warm.unobserve(media);
    }
  }, {rootMargin:'700px 0px', threshold:0});
  document.querySelectorAll('.enclosure-grid img, .itp-post video').forEach(media => warm.observe(media));
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (entry.intersectionRatio >= .5) { visible.add(entry.target); prepare(entry.target); }
      else visible.delete(entry.target);
      sync(entry.target);
    }
  }, {threshold:[0,.5]});
  for (const video of videos) {
    video.autoplay = false;
    video.pause();
    video.addEventListener('loadeddata', () => sync(video));
    observer.observe(video);
  }
  document.addEventListener('visibilitychange', () => videos.forEach(sync));
});
