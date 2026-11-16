import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { createDecisionLab } from '@decision-lab/sdk';

// Consumer helpers shared by these examples; this is not SDK implementation.
export const createdAt = '2026-11-15T00:00:00.000Z';
export const reportOptions = { scope: 'all', locale: 'en-US' };
export const examples = {
  'marble-evidence': {
    pattern: 'evidence-review/1',
    templateId: 'documentation-evidence-review',
    title: 'Review finite evidence',
  },
  'marble-learning': {
    pattern: 'assess-value-of-learning/1',
    templateId: 'documentation-learning-value',
    title: 'Assess the value of learning',
  },
};

export function locations(id) {
  if (!Object.hasOwn(examples, id)) throw new Error(`Unknown example: ${id}`);
  return {
    input: new URL(`${id}/`, import.meta.url),
    output: new URL(`../.output/${id}/`, import.meta.url),
  };
}

export const readText = url => readFile(url, 'utf8');
export async function writeJSON(url, value) {
  await mkdir(new URL('.', url), { recursive: true });
  const text = createDecisionLab().sources.renderJSON(value, { maxBytes: 50_000_000 });
  await writeFile(url, `${text}\n`);
}

export function summarize(run) {
  // Deliberately small regression summary. The complete reports remain in run.report.
  const summary = {
    description: 'Example verification summary only; not a complete RunBundle or report.',
    format: run.format,
    execution: run.execution.status,
    assessment: run.assessment.status,
    pattern: run.identity.pattern,
    viewIds: Object.keys(run.report.views).sort(),
    materialized: run.report.completeness.materialized,
    allRetainedContexts: run.report.completeness.allRetainedContexts,
  };
  if (run.assessment.queries) summary.answers = run.assessment.queries.map(({ id, status, answer }) => ({ id, status, answer }));
  if (run.assessment.recommendation) summary.recommendation = run.assessment.recommendation;
  return summary;
}
