/* Play silent clips only while most of each clip is in view. */
document.addEventListener('DOMContentLoaded', () => {
  const videos = [...document.querySelectorAll('.itp-post video')];
  const visible = new Set();
  const sync = video => {
    if (document.visibilityState === 'visible' && visible.has(video)) {
      if (video.paused) {
        video.muted = true;
        video.play().catch(() => {});
      }
    } else if (!video.paused) video.pause();
  };
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (entry.intersectionRatio >= .5) visible.add(entry.target);
      else visible.delete(entry.target);
      sync(entry.target);
    }
  }, {threshold: [0, .5]});
  for (const video of videos) observer.observe(video);
  document.addEventListener('visibilitychange', () => videos.forEach(sync));
});
