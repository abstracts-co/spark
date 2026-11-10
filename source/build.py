import base64, pathlib

here = pathlib.Path(__file__).parent
font = base64.b64encode((here / 'figtree.woff2').read_bytes()).decode()
css = (here / 'app.css').read_text().replace('__FONT__', font)
html = (here / 'app.html').read_text().replace('__CSS__', css).replace('__JS__', (here / 'app.js').read_text())
out = here.parent / 'artifacts' / 'spark' / 'index.html'
out.write_text(html)
print(out, len(html))
