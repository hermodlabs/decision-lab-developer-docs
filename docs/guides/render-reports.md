# Render reports from output alone

`lab.run()` and `decision-lab run --reports all` produce a
`decision-lab-run/1` bundle. Its `report` is the presentation contract. A renderer
can construct the report views without the app package, canonical model or
evaluator.

The SDK prepares the conclusions and the data. Your application chooses the
visual layout, chart geometry, paging and current selection. There is no required
React dependency or separately supported public React renderer package.

## Follow the supplied structure

| Report field | Renderer responsibility |
| --- | --- |
| `navigation` | Show the supplied hierarchy and follow its literal `targetViewId`. |
| `views` | Resolve a view by ID; show its supplied title, question, description and blocks. |
| `datasets` | Resolve a block's `datasetId`; draw the prepared content. |
| `selection` | Initialize and synchronize question, explanation, study and scenario choices. |
| `contextIndexes` | Resolve the declared key tuple to an already prepared context/dataset. |
| `notices`, `completeness`, `provenance` | Preserve qualifications, delivery/assessment distinctions and calculation identity. |

A generic table dataset has `kind: 'table'`, `label`, `columns` and `rows`. Each
row contains `cells[column.id]`. A cell supplies `display`, typed `raw` data,
`available`, and optional `reason`, `description` and navigation `action`.

Render `display`; use `available` to distinguish an unavailable value from a
valid zero, `false`, empty string or empty collection. Do not invent a conclusion
by testing whether `raw` is truthy.

## A complete minimal table viewer

Save the following as `report-tables.html`. Open it in a browser and choose a
`*.run.json` created by either package. It requires no SDK, server, framework,
app configuration or evaluator. It lists all delivered generic table datasets,
including tables prepared for different selection contexts.

This is a table inspector, rather than a complete implementation of every view
kind. The next section describes the additional contracts a full renderer uses.

```html
<!doctype html>
<html lang="en">
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Decision Lab report tables</title>
<style>
  body { font: 16px system-ui; margin: 2rem; color: #193849; }
  label, select { display: block; margin: 1rem 0; }
  select { max-width: 100%; }
  table { border-collapse: collapse; width: 100%; }
  th, td { padding: .65rem; text-align: left; border: 1px solid #d7e0e5; }
  th { background: #eef4f7; }
  td[data-unavailable] { color: #687985; }
  pre { white-space: pre-wrap; }
</style>
<h1>Report tables</h1>
<label>Run JSON <input id="file" type="file" accept=".json,application/json"></label>
<p id="status" role="status">Choose a run file.</p>
<pre id="notices"></pre>
<label>Delivered table <select id="tables" disabled></select></label>
<main id="content"></main>
<script type="module">
  const file = document.querySelector('#file');
  const picker = document.querySelector('#tables');
  const status = document.querySelector('#status');
  const notices = document.querySelector('#notices');
  const content = document.querySelector('#content');
  let report;

  function element(tag, text) {
    const node = document.createElement(tag);
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function showTable() {
    content.replaceChildren();
    const dataset = report?.datasets[picker.value];
    if (!dataset || dataset.kind !== 'table') return;
    const table = element('table');
    table.append(element('caption', dataset.label));
    const header = element('tr');
    for (const column of dataset.columns) {
      const th = element('th', column.label);
      th.scope = 'col';
      header.append(th);
    }
    const head = element('thead');
    head.append(header);
    table.append(head);
    const body = element('tbody');
    for (const row of dataset.rows) {
      const tr = element('tr');
      for (const column of dataset.columns) {
        const cell = row.cells[column.id];
        const td = element('td', cell.display);
        if (!cell.available) td.dataset.unavailable = 'true';
        td.title = [cell.description, cell.reason].filter(Boolean).join('\n');
        tr.append(td);
      }
      body.append(tr);
    }
    table.append(body);
    content.append(table);
  }

  picker.addEventListener('change', showTable);
  file.addEventListener('change', async () => {
    content.replaceChildren();
    picker.replaceChildren();
    picker.disabled = true;
    notices.textContent = '';
    report = undefined;
    try {
      const selected = file.files[0];
      if (!selected) return;
      const run = JSON.parse(await selected.text());
      if (run.format !== 'decision-lab-run/1' ||
          run.report?.format !== 'decision-lab-report/1') {
        throw new Error('Choose a supported Decision Lab run bundle.');
      }
      report = run.report;
      status.textContent = `Execution: ${run.execution.status}. ` +
        `Report materialized: ${report.completeness.materialized}. ` +
        `Assessment complete: ${report.completeness.assessmentComplete}.`;
      notices.textContent = report.notices.length
        ? JSON.stringify(report.notices, null, 2) : '';
      for (const [id, dataset] of Object.entries(report.datasets)) {
        if (dataset.kind !== 'table') continue;
        const option = element('option', `${dataset.label} — ${id}`);
        option.value = id;
        picker.append(option);
      }
      picker.disabled = picker.options.length === 0;
      if (picker.disabled) content.append(element('p', 'No table datasets delivered.'));
      else showTable();
    } catch (error) {
      report = undefined;
      status.textContent = error.message;
    }
  });
</script>
</html>
```

The viewer inserts supplied strings through `textContent`, rather than treating
them as HTML. It performs a format check for demonstration. Validate imported
artifacts with `lab.runs.validate` or `lab.reports.validate` at your application's
admission boundary; format tags alone do not establish contract integrity.
Native `JSON.parse` is sufficient here because the inspector only renders
prepared display values. Use the SDK's artifact parser/serializer when preserving
signed-zero-sensitive execution identities or round-tripping bound artifacts.

## Build a full renderer

Walk the selected `ReportView.blocks` in order. `text` and `json` blocks already
contain their text. Dataset blocks name their prepared dataset. The block kinds
and all exact structures are documented in [report output](../reference/report-output.md).

Question/explanation and connection blocks reference a `contextIndexId`.
Read that index's `keys`, match the selected tuple against its `entries`, and
render the included prepared dataset/context. `selection.contextKeys` maps
canonical context keys to client selection fields. Keep one selection object
shared across tabs so repeated controls stay synchronized.

When a cell has an `action`, merge its literal `selection` patch into that state,
then follow `targetViewId` if supplied. A selection-only action does not change
the current view. Do not infer destinations from IDs, answer text or status
labels. Preserve explicit `null` values in patches, such as clearing a learning
scenario when selecting a current-study response.

Specialized representations also arrive prepared:

- **Evidence connections:** resolved nodes, edges, paths, selector options,
  business labels, details and qualifications. Choose Table or Diagram and draw
  the supplied graph; do not traverse the model to derive a different one.
- **Learning payoff bars:** formatted rows, plotted measure, units and an
  acting-now reference when established. Draw the supplied benchmark and retain
  ties and unavailable values.
- **Learning timelines:** timing rows, milestones, units, roles and qualifications.
  Choose Table or Timeline without turning declared timing into a claim that
  physical work was completed.

Changing a representation is local view state. Changing case inputs requires a
new run. If a new draft is pending or invalid, label any retained earlier report
as earlier output; do not attribute its finding to the unassessed draft.

## Keep delivery and assessment separate

`completeness.materialized` and related fields describe the delivered report.
`completeness.assessmentComplete` and `run.execution.status` describe calculation
coverage. Show supplied notices even when all requested report views arrived.
Timeout, cancellation, resource limits and invalid input remain visible report
states. An output delivery limit fails explicitly instead of silently removing
rows or contexts.
