import base64, json, pathlib

here = pathlib.Path(__file__).parent
viewer = (here / 'viewer.html').read_text()
font = base64.b64encode((here / 'figtree.woff2').read_bytes()).decode()
css = (here / 'app.css').read_text().replace('__FONT__', font)
js = (here / 'app.js').read_text().replace('__VIEWER__', json.dumps(viewer).replace('</', '<\\/'))
html = (here / 'app.html').read_text().replace('__CSS__', css).replace('__JS__', js)
out = here.parent / 'artifacts' / 'spark' / 'index.html'
out.write_text(html)
print(out, len(html))
