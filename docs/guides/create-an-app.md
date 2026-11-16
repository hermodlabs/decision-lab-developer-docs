# Create an app from a template

An app supplies a domain model within its template's installed pattern. The
module author declares the entities, rules, questions, assumptions and report
language. The canonical model also includes a starting case.

This guide uses `examples/marble-evidence/model.yaml`. Complete the matching
SDK or CLI path in [create a template](create-a-template.md) first. Run all
commands from this documentation repository's root.

## Review the canonical model

The model has three top-level fields:

```yaml
format: evidence-review/1
module: # Published domain declarations and rules.
case:   # Starting facts and parameter values.
```

These comments explain the shape; use the complete example file as input.
Its module declares the heavy-marble alternatives, predictions from pan
membership, a global report-error check, and separate containing-bag and
exact-marble questions. Its case supplies nine marbles, layouts and observations.

## SDK

Save this as `create-app.mjs`:

```js
import { readFile, writeFile } from 'node:fs/promises';
import { createDecisionLab } from '@decision-lab/sdk';

const lab = createDecisionLab();
const template = lab.templates.open(await readFile(
  '.output/tutorial/sdk/evidence.template.json', 'utf8'));
const source = await readFile('examples/marble-evidence/model.yaml', 'utf8');
const definition = lab.apps.create({
  template,
  appId: 'tutorial-marble-evidence',
  release: 1,
  model: lab.sources.parseModel(source),
  source,
});

const validation = lab.apps.validate(definition);
if (!validation.valid) throw new Error(JSON.stringify(validation.issues));

const app = lab.apps.pack(definition, {
  createdAt: '2026-11-15T00:00:00.000Z',
  name: 'Review marble evidence',
  description: 'Check what the submitted weighing record establishes.',
});
await writeFile('.output/tutorial/sdk/marble.app.json',
  lab.sources.renderJSON(app, { space: 2 }), { flag: 'wx' });

const reopened = lab.apps.open(app);
const initialCase = lab.cases.create({ app: reopened });
console.log(lab.cases.validate({ app: reopened, case: initialCase }));
```

```sh
node create-app.mjs
```

Supplying `source` preserves the exact canonical source text and checks that it
matches the supplied model. If source is omitted, the SDK identifies its source
as generated. Parsing source checks syntax and format; app creation, validation
and packing enforce the module/template and publication checks.

## CLI

```sh
npm exec --offline -- decision-lab app init \
  --template .output/tutorial/cli/evidence.template.json \
  --model examples/marble-evidence/model.yaml \
  --app-id tutorial-marble-evidence --release 1 \
  --output .output/tutorial/cli/marble.app.yaml
npm exec --offline -- decision-lab app validate \
  .output/tutorial/cli/marble.app.yaml
npm exec --offline -- decision-lab app pack \
  .output/tutorial/cli/marble.app.yaml \
  --created-at 2026-11-15T00:00:00.000Z \
  --output .output/tutorial/cli/marble.app.json
npm exec --offline -- decision-lab app open \
  .output/tutorial/cli/marble.app.json
npm exec --offline -- decision-lab case init \
  --app .output/tutorial/cli/marble.app.json \
  --output .output/tutorial/cli/marble.case.yaml
npm exec --offline -- decision-lab case validate \
  --app .output/tutorial/cli/marble.app.json \
  --case .output/tutorial/cli/marble.case.yaml
```

`app init` produces an editable definition. `app pack` produces a frozen
`decision-lab-app/1` package with its template association and content identity.
The CLI refuses to replace immutable packages, including with `--force`.

## What can change after publication?

The case worker can change the basis, observations and parameter values admitted
by the module. They can select from its published questions. They cannot change
the generation rule, the meaning of a mismatch, relation types, question
definitions or presentation by embedding an edited module in a case.

Publish changed module declarations as a new app release. A changed template
contract needs a new template version. The SDK validates identities; your
application or publishing service owns its release registry and collision policy.

Invalid module declarations block app creation. Invalid initial case values may
be inspected in an editable definition but cannot be packed as a valid new app.
After publication, diagnostic assessment of invalid case values is supported so
users can understand what needs correction.

Next: [run and compare cases](run-and-compare-cases.md). That guide uses the
prepackaged example app so it can also be followed independently.
