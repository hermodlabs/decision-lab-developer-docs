# Create a template

A template selects an installed reasoning pattern and states the requirements
for authors who build apps from it. This guide creates an evidence-review
template for finite, explicitly bounded records.

Install the packages using [SDK.md](../../SDK.md) or [CLI.md](../../CLI.md).
Run the commands from this documentation repository's root. SDK and CLI examples
use separate output directories so they can both be tried.

## SDK

Save this as `create-template.mjs` in the repository root:

```js
import { mkdir, writeFile } from 'node:fs/promises';
import { createDecisionLab } from '@decision-lab/sdk';

const lab = createDecisionLab(); // Authoring alone needs no worker executor.
const definition = lab.templates.create({
  templateId: 'finite-evidence-review',
  version: '1.0.0',
  pattern: 'evidence-review/1',
  title: 'Review finite evidence',
  description: 'Determine what a fixed record establishes under reviewed rules.',
  authoring: {
    guidance: 'State the conclusion boundary, publish the questions, and explain the assumptions.',
    requiredModuleFields: ['assumptions', 'presentation.findingGroups'],
  },
});

const validation = lab.templates.validate(definition);
if (!validation.valid) throw new Error(JSON.stringify(validation.issues));

const template = lab.templates.pack(definition, {
  createdAt: '2026-11-15T00:00:00.000Z',
});
await mkdir('.output/tutorial/sdk', { recursive: true });
await writeFile('.output/tutorial/sdk/evidence.template.definition.json',
  lab.sources.renderJSON(definition, { space: 2 }), { flag: 'wx' });
await writeFile('.output/tutorial/sdk/evidence.template.json',
  lab.sources.renderJSON(template, { space: 2 }), { flag: 'wx' });
console.log(template.format, template.contentHash);
```

```sh
node create-template.mjs
```

The definition remains editable. Packing it produces an immutable
`decision-lab-template/1` package. The example's `wx` file mode refuses accidental
replacement; use a new output directory when repeating the tutorial.

The app guide uses this template. Its restrictions require nonempty assumptions
and finding groups in addition to the installed pattern's ordinary validation.

## CLI

The CLI initializes its definition with the installed contract included:

```sh
mkdir -p .output/tutorial/cli
npm exec --offline -- decision-lab template init \
  --pattern evidence-review/1 \
  --id finite-evidence-review \
  --version 1.0.0 \
  --title "Review finite evidence" \
  --output .output/tutorial/cli/evidence.template.yaml
```

In that YAML file, set the existing `authoring` fields to:

```yaml
authoring:
  guidance: "State the conclusion boundary, publish the questions, and explain the assumptions."
  requiredModuleFields: [assumptions, presentation.findingGroups]
```

Leave the generated `contract` intact. Then validate and pack:

```sh
npm exec --offline -- decision-lab template validate \
  .output/tutorial/cli/evidence.template.yaml
npm exec --offline -- decision-lab template pack \
  .output/tutorial/cli/evidence.template.yaml \
  --created-at 2026-11-15T00:00:00.000Z \
  --output .output/tutorial/cli/evidence.template.json
```

CLI immutable template packages cannot be overwritten with `--force`. Change
the template version and choose a new output filename for a new publication.
The SDK also preserves package content hashes, while storage collision policy
remains the application developer's responsibility.

## Pick requirements deliberately

`requiredModuleFields` accepts distinct paths listed in
`definition.contract.schema.moduleFields`. Each selected path must be populated
when an app is created. The restriction does not define new types, formulas or
relationships; the installed module validator still does that work.

For a learning-value template, choose `assess-value-of-learning/1` instead. Its
contract exposes different structural fields and case inputs. Do not copy an
evidence-specific restriction such as `presentation.findingGroups` into it.

Next: [create an app](create-an-app.md) using this template and the marble model.
