# Vendored libraries

Served from this site so that pages do not depend on a third-party CDN at runtime.
Files are unmodified copies from the npm release tarballs. Upgrade deliberately:
add a new versioned folder, update the page, test, then remove the old folder.

| Library | Version | Used by | License |
|---|---|---|---|
| maplibre-gl | 4.7.1 | tools/distributions/ | BSD-3-Clause (LICENSE.txt) |
| pmtiles | 3.2.1 | tools/distributions/ | BSD-3-Clause (LICENSE.txt) |

Source tarballs and their npm `dist.integrity` values (checked 2026-11-05):

- https://registry.npmjs.org/maplibre-gl/-/maplibre-gl-4.7.1.tgz
  `sha512-lgL7XpIwsgICiL82ITplfS7IGwrB1OJIw/pCvprDp2dhmSSEBgmPzYRvwYYYvJGJD7fxUv1Tvpih4nZ6VrLuaA==`
- https://registry.npmjs.org/pmtiles/-/pmtiles-3.2.1.tgz
  `sha512-3R4fBwwoli5mw7a6t1IGwOtfmcSAODq6Okz0zkXhS1zi9sz1ssjjIfslwPvcWw5TNhdjNBUg9fgfPLeqZlH6ng==`

SHA-384 of the files here (identical to what unpkg.com served for the same versions):

- `maplibre-gl-4.7.1/maplibre-gl.js` sha384-SYKAG6cglRMN0RVvhNeBY0r3FYKNOJtznwA0v7B5Vp9tr31xAHsZC0DqkQ/pZDmj
- `maplibre-gl-4.7.1/maplibre-gl.css` sha384-MinO0mNliZ3vwppuPOUnGa+iq619pfMhLVUXfC4LHwSCvF9H+6P/KO4Q7qBOYV5V
- `pmtiles-3.2.1/pmtiles.js` sha384-QfbOCebHNw8pQiPAOd2IFee2v2A5VYZxBk0+JGZ5H+3mfzVIp6zsQNkTsfGJot93

The source map (`maplibre-gl.js.map`, 4.7 MB) is left out. Browsers request it
only while developer tools are open, so a 404 for it there is expected.

pmtiles' npm package has no license file; LICENSE.txt is the BSD-3 license from
https://github.com/protomaps/PMTiles.
