# Canonical YAML and model reference

The SDK supports two installed model formats: `evidence-review/1` and `assess-value-of-learning/1`. Both use the same envelope:

```yaml
format: evidence-review/1
module: {}
case: {}
```

The empty objects above illustrate the envelope, not a valid complete model. The **module author** supplies `module`; the **case worker** supplies `case`. Packing an app freezes the module. Published case input cannot replace its rules, identities, presentation, or report bindings.

JSON is equally canonical input. YAML is a human-readable encoding of the same finite data, not a language for executing JavaScript. See the [SDK API](sdk-api.md) for parsing and validation stages.

## YAML syntax

Accepted syntax includes scalar values, indented mappings/sequences, and flow arrays/maps. Use spaces for indentation. Quote variable names such as `"?marble"` and strings whose scalar interpretation could be ambiguous. Double-quoted JSON string escapes are supported.

Duplicate properties are rejected. Tags, anchors, aliases, merge keys, block strings (`|` and `>`), multiple-document directives, and trailing commas in YAML flow arrays are unsupported. Model and case source text is limited to 200,000 characters. `syntax.renderDefinitionYAML(value)` generates the supported subset.

```js
const model = lab.sources.parseModel(text, { file: 'model.yaml' });
// Parsing checks syntax and envelope. App creation validates module meaning.
const definition = lab.apps.create({ template, appId: 'example', release: 1, model, source: text });
const app = lab.apps.pack(definition);
const validation = lab.cases.validate({ app, case: model.case });
```

## Common module fields

Both patterns require `id`, `version`, `title`, `description`, `question`, and `boundary`. `description` may be empty; the other descriptive fields must be nonblank. Domain questions and report labels should express the decision in the user's vocabulary.

Module entity identifiers generally start with an ASCII letter and contain letters, digits, `_`, `.`, `:`, or `-`, up to 80 characters. Identity fields in template/app envelopes have separate limits. Use explicit identifiers consistently; labels are display text, not foreign keys.

Optional common fields are `assumptions`, `metadata`, and `presentation`. Supported presentation fields differ by pattern. Unknown fields in validated structural declarations are rejected. Arbitrary metadata does not install new evaluator behavior.

## Evidence review

Evidence review generates declared finite interpretations, checks them against evidence and constraints, and asks whether the selected answers are stable across all admitted interpretations. An interpretation is a possible explanation under the authored model, not a probability estimate.

| Required module field | Meaning |
| --- | --- |
| `relations` | Typed schemas for submitted facts, candidate assignments, and derived facts. |
| `generation` | Finite subset dimensions over submitted values. May be empty. |
| `rules` | Derived-relation rules. May be empty. |
| `constraints` | Checks that exclude generated interpretations. May be empty. |
| `queries` | Nonempty list of exact questions to answer. |

Optional evidence fields include `parameters`, `admission`, `reports`, and the common optional fields.

### Relations and parameters

```yaml
relations:
  - id: marble
    source: basis
    columns:
      - {id: id, type: string}
      - {id: bag, type: string}
    key: [id]
  - id: heavy
    source: assignment
    columns: [{id: id, type: string}]
  - id: heavy_bag
    source: derived
    columns: [{id: bag, type: string}]
parameters:
  - {id: maxHeavy, type: integer, min: 1, max: 2, default: 1}
```

Relation `source` is `basis`, `evidence`, `assignment`, or `derived`. Input sources accept submitted rows; assignment sources are generated; rules write derived sources. Column types are `string`, `number`, `integer` (safe integer), and `boolean`.

A column may declare `references: {relation: RELATION, column: COLUMN}` to a same-type submitted basis/evidence column. A relation's optional `key` selects its uniqueness columns; otherwise the entire fact is unique. Input rows must contain exactly their declared columns.

Parameters use the same four scalar types and may declare `label`, `description`, `min`, `max`, `default`, and `enum`. Case values must satisfy the declarations; undeclared parameters are rejected.

### Generation

```yaml
generation:
  - id: choose-heavy
    relation: heavy
    from: {relation: marble, column: id}
    min: 1
    max: {parameter: maxHeavy}
```

Each dimension selects subsets of values from a submitted input column. Its target is a one-column assignment relation of the same type. Bounds are nonnegative integers or declared integer parameter references. Each assignment relation needs exactly one generator. These declarations bound the alternatives; the SDK does not discover unstated faults or hypotheses.

### Rule language

```yaml
rules:
  - id: locate-heavy-bag
    head: {relation: heavy_bag, args: ["?bag"]}
    body:
      - {relation: heavy, args: ["?id"]}
      - {relation: marble, args: ["?id", "?bag"]}
```

Atoms use positional arguments in the relation's column order. A string beginning with `?` denotes a variable and must match `?` followed by a letter and then letters/digits/underscores. Use `{literal: "?text"}` when a literal scalar needs disambiguation. Other term forms are scalars, `{parameter: ID}`, `{add: [LEFT, RIGHT]}`, and `{subtract: [LEFT, RIGHT]}`.

Supported body clauses are:

| Form | Meaning |
| --- | --- |
| `{relation: ID, args: [...]}` | Positive relation atom; binds variables. |
| `{not: {relation: ID, args: [...]}}` | Negated atom; its variables must already be bound. |
| `{count: {relation: ID, args: [...]}, as: "?count"}` | Count matching facts into a fresh variable. |
| `{op: eq, args: [LEFT, RIGHT]}` | Comparison; also `ne`, `lt`, `lte`, `gt`, `gte`. |
| `{op: exists, atom: {relation: ID, args: [...]}}` | Existence test; also `notExists`. |

Rules can only write derived relations. Head variables and comparison operands must be bound. Arithmetic construction in heads is unsupported so rule domains remain finite. Positive recursion is supported; recursion through negation or count is rejected unless dependencies can be stratified. This is a bounded relational language, not arbitrary Datalog or a general scripting engine.

### Constraints and admission

Each declaration has `id`, `label`, `when` (body clauses), and `assert` (a comparison or existence operation):

```yaml
constraints:
  - id: observed-bag
    label: The heavy marble must be in the observed bag.
    when:
      - {relation: heavy_bag, args: ["?bag"]}
    assert: {op: eq, args: ["?bag", "A"]}
```

`constraints` filter candidate interpretations. Optional `admission` declarations have the same shape but inspect only submitted basis/evidence relations before enumeration. Their purpose is to reject invalid starting records, not to remove inconvenient generated alternatives after the fact.

### Queries and report tables

```yaml
queries:
  - id: containing-bag
    label: Which bag contains the heavy marble?
    kind: value
    body: [{relation: heavy_bag, args: ["?bag"]}]
    select: ["?bag"]
reports:
  tables:
    - {id: candidate-marbles, label: Possible heavy marbles, relation: heavy, columns: [id]}
```

Boolean queries check whether their body has a match. Value and set queries require nonempty `select` projections; these determine the requested resolution. A value query requires exactly one distinct projected value in each admitted interpretation. A set query supports plural or empty answers. A one-column projection returns scalars; a multi-column projection returns tuples. Compare answers using the SDK's status and typed output.

`kind: probability` is recognized but yields **`not-assessed`**: this pattern has no probability contract. Counts of retained interpretations do not establish probabilities. Use the learning pattern for an explicit probability-based decision calculation.

Optional `reports.tables` declares labeled column projections of relations. Presentation metadata can organize findings and explanations, bind labels to entities/columns, and define validated connection views. Its bindings refer to declared data; they do not execute expressions or change conclusions.

### Evidence case fields

```yaml
case:
  id: marble-case
  scope: The supplied marbles and the stated heavy-marble bound.
  parameters: {maxHeavy: 1}
  basis:
    marble:
      - {id: m1, bag: A}
      - {id: m2, bag: B}
  evidence: {}
  queryIds: [containing-bag]
  evaluation: {maxCandidates: 1000}
```

Required fields are `id`, `scope`, `parameters`, `basis`, `evidence`, and `queryIds`. Optional fields are `title` and `evaluation`. Basis/evidence maps contain rows for declared input relations; omitted declared relations behave as empty tables. `queryIds` must select one or more distinct published queries. Evaluation settings can **lower**, not raise, installed limits: `maxCandidates`, `maxRuleRounds`, `maxFacts`, and `maxOperations`.

## Assess the value of learning

This pattern compares the best available action now with finite studies and report-dependent responses, under explicit state probabilities, monetary consequences, cash requirements, and deadlines. It is conditional risk-neutral expected-money analysis.

| Required module field | Meaning |
| --- | --- |
| `objective` | `criterion`, `unit`, `timeUnit`, `beneficiary`, and `horizon`. Criterion is fixed to `risk-neutral-expected-money`. |
| `attributes` | Typed state attributes used by accepted facts; may be empty. |
| `states` | Nonempty finite hidden-state list, each with `id`, `label`, and every declared attribute. |
| `actions` | Nonempty action identities and labels. |
| `studies` | Study identities and their observable report identities, including explicit no-report outcomes where applicable. May be empty. |

```yaml
objective:
  criterion: risk-neutral-expected-money
  unit: credits
  timeUnit: minutes
  beneficiary: The decision maker
  horizon: This choice
attributes: []
states:
  - {id: heavy-A, label: Heavy marble in bag A, attributes: {}}
  - {id: heavy-B, label: Heavy marble in bag B, attributes: {}}
actions:
  - {id: choose-A, label: Choose bag A}
  - {id: choose-B, label: Choose bag B}
studies:
  - id: weigh
    label: Weigh the bags
    reports:
      - {id: indicates-A, label: Scale indicates A, kind: report}
      - {id: indicates-B, label: Scale indicates B, kind: report}
```

Attributes have `id`, `label`, and type `string`, `number`, or `boolean`. Studies have nonempty report lists with `kind: report` or `no-report`; `no-study` is a reserved study identifier. The installed baseline is the best available action now; authors need not create a fake study for it.

Optional `recordTypes` declares typed reference-only tables. Each has `id`, `label`, and `columns` with `id`, `label`, and type `string`, `number`, or `boolean`. Entering a record does not make it an accepted fact.

### Learning case fields

All of these are required:

| Field | Shape / interpretation |
| --- | --- |
| `id`, `scope` | Case identity and decision boundary. |
| `currentTime` | Nonnegative relative time in the declared unit. |
| `cashBudget` | Nonnegative cash limit; `null` explicitly omits the cash constraint. |
| `probabilityBasis` | `{ source: TEXT, scope: TEXT }`, identifying the assessed distributions. |
| `priors` | One `{state, probability}` row per declared state; sum is one. |
| `actions` | One `{action, cash, deadline}` row per action. Cash is nonnegative; deadline is nonnegative or `null`. |
| `payoffs` | Complete action/state matrix of `{action, state, value}` rows. Values are finite money amounts. |
| `studies` | One `{study, fee, duration, likelihoods}` row per declared study. Fees/durations are nonnegative. |
| `acceptedFacts` | Explicit `{id, attribute, value, source}` rows over declared attributes; may be empty. |

Likelihoods supply **every** `{state, report, probability}` cell for a study, including zeros, with each state's report probabilities summing to one. Priors and likelihoods accept finite numbers in `[0, 1]` or nonnegative rational strings such as `"1/2"`. The normalization tolerance is `1e-9`. Missing distributions are not inferred from state counts.

Deadlines compare action availability with the current or study-completion time. Cash requirements constrain availability; study fees also reduce expected operating payoff **once**. They are not silently treated as independent extra payoff deductions. State/action cash and payoff semantics should be reviewed consistently before publication.

Optional case fields are `title`, `records`, and `sensitivity`. `records` maps declared record-type IDs to exact typed rows. Accepted facts condition the state distribution; contradictions or zero surviving probability prevent a supported recommendation.

Sensitivity entries require `id` and `label`; they may override `priors`, `fees`, `payoffs`, `cashBudget`, and `durations`. Priors/payoffs overrides remain complete distributions/matrices. Fee/duration overrides are lists of `{study, fee}` or `{study, duration}` entries. Sensitivity changes case assumptions, not module identities, report names, the objective criterion, or hidden-state response rules.

### Learning presentation and visual views

`presentation.labels` supports `baseline`, `study`, `action`, `state`, and `report`. `presentation.reports` customizes `comparison`, `responses`, `sensitivity`, `inputs`, and `history`, each with optional `title`, `question`, and `description`. `presentation.basisGroups` organizes the supplied basis; `presentation.views` declares supported visual projections.

```yaml
presentation:
  labels: {baseline: Choose now, study: Weighing}
  views:
    - id: weighing-value
      version: 1
      component: economic-comparison
      dataset: economic-comparison
      title: Is weighing worth its cost?
      question: Which option has the greatest expected net payoff?
      representations: [table, bar]
      defaultRepresentation: bar
      measure: netValue
```

Installed datasets are `economic-comparison` (component `economic-comparison`, table/bar) and `study-timing`, `timing-sensitivity`, `declared-milestones` (component `temporal-comparison`, table/timeline). Every view retains the table representation. Monetary measures are `netValue`, `grossValue`, `fee`, or `incrementalValue`.

View labels can use business terms for declared field roles. Milestone views bind numeric time columns in reference records; they remain reference-only. Calculated study timelines show prospective duration/deadline consequences, not a complete resource scheduling proof or actual execution. See [report output](report-output.md) for renderer responsibilities.

## Validation authority

The installed declarations and validators are authoritative for exact accepted fields and limits. Inspect a template's `contract` for its structural/input ownership, validators, capabilities, and installed bounds; read exported TypeScript interfaces for public typed shapes. This document is not a replacement JSON Schema and does not imply arbitrary plugins or new evaluator languages can be loaded from YAML.
