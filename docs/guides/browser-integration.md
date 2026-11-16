# Use the SDK in a browser

Browser clients use the portable SDK plus its browser worker executor:

```js
import { createDecisionLab } from '@decision-lab/sdk';
import { createBrowserExecutor } from '@decision-lab/sdk/browser';
```

Evaluation, optional prior-input recomputation and complete report preparation
run inside a terminable module worker. Importing the package or creating an idle
executor does not start that worker. React is optional.

## Create a small Vite client

Use a module-worker-aware bundler and serve the client over HTTP. Vite `8.3.0`
is the qualified bundler for SDK `0.1.0`. The package already includes its worker
assets; use the public exports without source aliases or copied worker code.

From this documentation repository's root:

```sh
mkdir -p .output/browser-demo/public
cp examples/marble-evidence/app.json .output/browser-demo/public/app.json
cp examples/marble-evidence/case.yaml .output/browser-demo/public/case.yaml
cd .output/browser-demo
npm init -y
npm pkg set type=module 'scripts.dev=vite' 'scripts.build=vite build' 'scripts.preview=vite preview'
npm install @decision-lab/sdk@0.1.0
npm install --save-dev vite@8.3.0
```

The registry install command applies after publication. For a candidate release,
replace the SDK package specifier with the absolute tarball path described in
[SDK.md](../../SDK.md). No Decision Lab UI dependency is required.

Save this as `index.html` inside `.output/browser-demo`:

```html
<!doctype html>
<html lang="en">
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Marble evidence client</title>
<h1>Review marble evidence</h1>
<button id="run">Calculate</button>
<button id="cancel" disabled>Cancel</button>
<p id="status" role="status">Ready.</p>
<pre id="output"></pre>
<script type="module" src="/main.js"></script>
</html>
```

Save this as `main.js` in the same directory:

```js
import { createDecisionLab } from '@decision-lab/sdk';
import { createBrowserExecutor } from '@decision-lab/sdk/browser';

const executor = createBrowserExecutor();
const lab = createDecisionLab({ executor });
const runButton = document.querySelector('#run');
const cancelButton = document.querySelector('#cancel');
const status = document.querySelector('#status');
const output = document.querySelector('#output');
let controller;
let latestRequest = 0;

async function readText(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`${url}: HTTP ${response.status}`);
  return response.text();
}

runButton.addEventListener('click', async () => {
  const request = ++latestRequest;
  controller?.abort();
  const currentController = new AbortController();
  controller = currentController;
  runButton.disabled = true;
  cancelButton.disabled = false;
  status.textContent = 'Calculating…';
  output.textContent = '';
  try {
    const [appText, caseText] = await Promise.all([
      readText('/app.json'), readText('/case.yaml'),
    ]);
    const app = lab.apps.open(appText);
    const input = lab.cases.create({
      app, inputs: lab.sources.parseCase(caseText), source: caseText,
    });
    const run = await lab.run({
      app, case: input,
      execution: { signal: currentController.signal, timeoutMs: 15000 },
      reportOptions: { scope: 'all', locale: 'en-US' },
    });
    if (request !== latestRequest) return;
    status.textContent = `Execution: ${run.execution.status}; ` +
      `assessment complete: ${run.report.completeness.assessmentComplete}.`;
    // Keep the complete artifact available to the host application.
    window.latestDecisionLabRun = run;
    // Show report content only. A full renderer consumes these prepared views.
    output.textContent = JSON.stringify({
      notices: run.report.notices,
      navigation: run.report.navigation,
      views: run.report.views,
    }, null, 2);
  } catch (error) {
    if (request === latestRequest) status.textContent = `${error.code ?? 'ERROR'}: ${error.message}`;
  } finally {
    if (request === latestRequest) {
      controller = undefined;
      runButton.disabled = false;
      cancelButton.disabled = true;
    }
  }
});

cancelButton.addEventListener('click', () => controller?.abort());
window.addEventListener('pagehide', () => {
  controller?.abort();
  void executor.close();
}, { once: true });
```

Run the development server, or build and preview its production assets:

```sh
npm run dev
```

```sh
npm run build
npm run preview
```

Use the HTTP URL printed by Vite. A direct `file://` import of the npm package is
not this integration path. The production build must include the emitted worker
assets when deployed.

The sample's `/app.json`, `/case.yaml` and `/main.js` URLs assume a site served
at the origin root, as in the default Vite setup. For a deployment beneath a
subpath, configure the build base and asset URLs for that location.

## Fit this into an application

Keep the browser executor for the lifetime of the application or component and
close it when disposed. Use an `AbortController` to cancel superseded work, and
use a request identity check before accepting an asynchronous result. Cancelled
and timed-out runs retain explicit diagnostic reports; they do not invent
findings for the interrupted calculation.

The SDK owns no browser storage. Your client chooses whether to save cases,
retain run artifacts, accept imported packages or offer offline behavior. Merely
using the browser executor does not install a service worker or cache an app.

For reports, replace the demonstration's JSON display with a renderer that uses
`run.report` and one shared selection object. See [render reports](render-reports.md).
Representation toggles, such as Table/Diagram, belong to that client state;
they do not require re-evaluation.

Use `lab.sources.renderJSON` to export bound artifacts, with the explicit report
byte allowance when needed. The demonstration uses native `JSON.stringify`
only to display a small selection of presentation fields, not to serialize a
case or preserve its execution identity.
