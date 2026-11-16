import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { mkdir, mkdtemp } from 'node:fs/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { promisify } from 'node:util';
import { createDecisionLab } from '@decision-lab/sdk';
import { createNodeExecutor } from '@decision-lab/sdk/node';
import { author } from './author.mjs';
import { createdAt, examples, locations, readText, reportOptions, summarize } from './shared.mjs';

const execute = promisify(execFile);
const docsRoot = fileURLToPath(new URL('../', import.meta.url));
const executor = createNodeExecutor();
const lab = createDecisionLab({ executor });
const readJSON = async url => lab.sources.parseArtifact(await readText(url), { maxBytes: 50_000_000 });
async function invoke(command, args) {
  return execute(command, args, { cwd: docsRoot, timeout: 120_000, maxBuffer: 50_000_000 });
}
function validate(run) {
  assert.equal(lab.runs.validate(run).valid, true);
  assert.equal(lab.reports.validate(run.report).valid, true);
  assert.equal(run.execution.status, 'completed');
  assert.equal(run.report.completeness.materialized, true);
  assert.equal(run.report.completeness.allRetainedContexts, true);
  assert.equal(run.report.completeness.truncated, false);
}

try {
  for (const id of Object.keys(examples)) {
    const { input, output } = locations(id);
    await invoke(process.execPath, [fileURLToPath(new URL('sdk.mjs', input))]);
    await invoke('sh', [fileURLToPath(new URL('cli.sh', input))]);
    const sdk = await readJSON(new URL('sdk.run.json', output));
    const cli = await readJSON(new URL('cli.run.json', output));
    validate(sdk); validate(cli);
    assert.deepEqual(cli, sdk, `${id}: the complete SDK/CLI RunBundles must agree.`);
    assert.deepEqual(summarize(sdk), await readJSON(new URL('expected/summary.json', input)));

    // Use a new directory for immutable authoring packages on every verification.
    await mkdir(output, { recursive: true });
    const temporary = await mkdtemp(fileURLToPath(new URL('verification-', output)));
    const directory = pathToFileURL(`${temporary}/`);
    const sdkDirectory = new URL('sdk/', directory);
    const cliDirectory = new URL('cli/', directory);
    const { appPackage } = await author(id, sdkDirectory);
    await invoke('sh', [fileURLToPath(new URL('author.sh', input)), fileURLToPath(cliDirectory)]);
    assert.deepEqual(await readJSON(new URL('template.json', cliDirectory)), await readJSON(new URL('template.json', sdkDirectory)));
    assert.deepEqual(await readJSON(new URL('app.json', cliDirectory)), appPackage);
    assert.deepEqual(appPackage, await readJSON(new URL('app.json', input)), `${id}: shipped app must be reproducible from model.yaml.`);
    const cliCaseSource = await readText(new URL('case.yaml', cliDirectory));
    const app = lab.apps.open(appPackage);
    const snapshot = lab.cases.create({ app, inputs: lab.sources.parseCase(cliCaseSource), source: cliCaseSource });
    const authoredSDK = await lab.run({ app, case: snapshot, runId: `documentation-${id}`, createdAt, reportOptions });
    const authoredCLI = await readJSON(new URL('run.json', cliDirectory));
    validate(authoredSDK); validate(authoredCLI);
    assert.deepEqual(authoredCLI, authoredSDK, `${id}: authored apps must deliver the same complete reports.`);
    console.log(`${id}: SDK/CLI quickstart, reproducible authoring, complete report parity, and expected summary passed.`);
  }
} finally {
  await executor.close();
}
