import { mkdir, writeFile } from 'node:fs/promises';
import { createDecisionLab, syntax } from '@decision-lab/sdk';
import { createdAt, examples, locations, readText, writeJSON } from './shared.mjs';

// Authoring requires no executor. The installed pattern fixes the language and evaluator.
export async function author(id, destinationOverride) {
  const lab = createDecisionLab();
  const config = examples[id];
  const { input, output } = locations(id);
  const destination = destinationOverride ?? new URL('authoring/sdk/', output);
  await mkdir(destination, { recursive: true });
  const source = await readText(new URL('model.yaml', input));
  const model = lab.sources.parseModel(source);
  const templateDefinition = lab.templates.create({
    templateId: config.templateId, version: '1.0.0', pattern: config.pattern,
    title: config.title,
  });
  const templatePackage = lab.templates.pack(templateDefinition, { createdAt });
  const appDefinition = lab.apps.create({
    template: templatePackage, appId: `documentation-${id}`, release: 1,
    model, source,
  });
  const appPackage = lab.apps.pack(appDefinition, { createdAt });
  const app = lab.apps.open(appPackage);
  const defaultCase = lab.cases.create({ app });
  for (const [name, value] of [
    ['template.definition.json', templateDefinition], ['template.json', templatePackage],
    ['app.definition.json', appDefinition], ['app.json', appPackage],
  ]) await writeJSON(new URL(name, destination), value);
  await writeFile(new URL('case.yaml', destination), `${syntax.renderDefinitionYAML(defaultCase.inputs)}\n`);
  return { appPackage, caseInputs: defaultCase.inputs, destination };
}
