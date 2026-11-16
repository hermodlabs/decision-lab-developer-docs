import { createDecisionLab } from '@decision-lab/sdk';
import { createNodeExecutor } from '@decision-lab/sdk/node';
import { createdAt, locations, readText, reportOptions, writeJSON } from '../shared.mjs';

const { input, output } = locations('marble-evidence');
const executor = createNodeExecutor();
const lab = createDecisionLab({ executor });
try {
  const app = lab.apps.open(lab.sources.parseArtifact(await readText(new URL('app.json', input))));
  const source = await readText(new URL('case.yaml', input));
  const snapshot = lab.cases.create({ app, inputs: lab.sources.parseCase(source), source });
  const run = await lab.run({
    app, case: snapshot, runId: 'documentation-marble-evidence', createdAt, reportOptions,
  });
  const destination = new URL('sdk.run.json', output);
  await writeJSON(destination, run);
  console.log(`Wrote ${destination.pathname}`);
} finally {
  await executor.close();
}
