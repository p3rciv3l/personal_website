"""Full-resolution, image-only portfolio presentation for the ITP journal."""
from html import escape

def render_portfolio(post, path, marker):
    sources = []
    def node(item):
        if 'src' in item:
            src = escape(item['src'], quote=True)
            alt = escape(item['alt'], quote=True)
            w, h = int(item['width']), int(item['height'])
            sources.append(src)
            priority = 'high' if len(sources) <= 2 else 'auto'
            return f'<a class="photo" href="{src}" data-width="{w}" data-height="{h}" aria-label="Enlarge: {alt}"><img src="{src}" width="{w}" height="{h}" alt="{alt}" loading="eager" decoding="async" fetchpriority="{priority}"></a>'
        axis = item['axis']
        if axis not in ('row', 'column'):
            raise ValueError('Invalid portfolio axis')
        return f'<div class="composition {axis}" data-axis="{axis}">' + ''.join(node(x) for x in item['items']) + '</div>'
    sections = ''.join(f'<section class="collage" aria-label="Collage {i}">{node(b)}</section>' for i, b in enumerate(post['blocks'], 1))
    preloads = '\n'.join(f'  <link rel="preload" as="image" href="{src}">' for src in sources)
    return f'''<!DOCTYPE html>
{marker}
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="robots" content="noindex, nofollow, noarchive">
  <meta name="referrer" content="no-referrer">
  <title>Ambition - Avinash Krishna</title>
  <link rel="canonical" href="https://avikrishna.com{path.rstrip('/')}">
  <link rel="stylesheet" href="{path}ambition.css">
{preloads}
  <script src="{path}ambition.js" defer></script>
</head>
<body>
  <main><h1>Ambition</h1>{sections}</main>
  <dialog class="viewer" aria-label="Enlarged photograph">
    <button class="close" aria-label="Close enlarged photograph" autofocus><svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18"/></svg></button>
    <button class="previous" aria-label="Previous photograph"><svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true"><path d="m14 5-7 7 7 7"/></svg></button>
    <img alt="">
    <button class="next" aria-label="Next photograph"><svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true"><path d="m10 5 7 7-7 7"/></svg></button>
    <span class="viewer-status" role="status" aria-live="polite"></span>
  </dialog>
</body>
</html>
'''
