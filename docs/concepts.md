# Concepts and responsibilities

Decision Lab separates reusable reasoning from the facts of an individual case.
The public workflow is:

**Installed pattern → Template → App package → Case snapshot → Run → Report**

The SDK and CLI implement the same workflow. Neither requires the Decision Lab
web application, its storage, or its marketplace.

## What each artifact means

| Artifact | Purpose | What becomes fixed |
| --- | --- | --- |
| Installed pattern | Supplies a supported modeling language, validators, evaluator and report materializer. | The computational semantics and supported capabilities in the installed SDK version. |
| Template definition | Names a reusable authoring contract for one installed pattern, adds guidance and optionally requires populated module fields. | Nothing is published until it is packed. |
| Template package | Retains a versioned template definition and its content hash. | The template's association with its installed contract and authored restrictions. |
| App definition | Supplies a domain model: the module's rules and meaning, plus a starting case. | It is an editable authoring artifact until packed. |
| App package | Freezes the module, its presentation, starting case, template association and release identity. | A case cannot replace the published module. |
| Case snapshot | Binds supplied inputs to an exact app release and module. | The particular input snapshot; another input produces another snapshot. |
| Run bundle | Retains execution status, evaluated input, assessment and a complete report. | Which inputs and evaluator produced this output. |
| Report document | Supplies prepared views, datasets, labels, contexts and navigation. | The calculated presentation content; clients choose layout and selection state. |

An app is a configuration package, rather than a separately compiled application.
The same runtime can execute different apps within its installed patterns.

## Division of labor

These are responsibilities, rather than requirements for separate user accounts.
One person may perform all three authoring and case roles.

| Role | Judgment and work | Example: marble evidence |
| --- | --- | --- |
| Pattern/template author | Chooses the reusable decision problem, its meaning, supported question types, conclusion boundaries and authoring guidance. The installed runtime supplies the executable pattern. | Define finite evidence review: consider permitted explanations, apply declared rules, and assess what all compatible explanations establish. |
| Module author | Gives that structure domain meaning through declarations, rules, assumptions, question definitions and report language. Publishes a reviewed app release. | Declare marbles, bags, weighing layouts, one-heavy-marble generation, predicted outcomes, a global error limit and bag/identity questions. |
| Case worker | Supplies or revises facts and parameter values within the published module; checks the resulting reports. | Enter pan memberships and recorded outcomes; select the questions; state the allowed number of incorrect reports. |
| Application developer | Uses the SDK or CLI, stores artifacts, renders reports, manages selection and decides when output is accepted. | Build a weighing-record review tool without writing a new marble evaluator. |

People remain responsible for whether the question, assumptions and records fit
the actual situation. Two analysts may reasonably choose different models. The
runtime automates the consequences of the chosen declarations; it does not
select the uniquely correct decomposition of a human problem.

## Structure versus case input

The distinction depends on a field's meaning, rather than how often someone wants
to edit it. The module declares what a field means and which values are allowed.
The case supplies the value used for one calculation.

In the marble evidence app:

- **Module structure:** relation schemas, generation of exactly one heavy marble,
  rules for predicting outcomes, the meaning of the global report-error check,
  question definitions and report groups.
- **Case inputs:** listed marbles and their bag memberships, pan contents,
  observations, the declared error allowance and selected published questions.

Allowing the case worker to change an error allowance does not let them replace
the error rule. The published rule still compares mismatches across the whole
record against that parameter. A different rule requires a new app release.

For learning-value apps, state/action/study identities and the objective's
meaning are structural. Priors, payoffs, report likelihoods, fees, durations,
deadlines and budgets are case values within that structure.

Human guidance can explain why an input should change. The current SDK does not
implement a general ontology engine that infers people's motives or proves the
semantic adequacy of a model. Its automated checks enforce the installed
language, declarations, types, identities and calculated relationships.

## What a template can customize today

The supported pattern identifiers are `evidence-review/1` and
`assess-value-of-learning/1`. A template selects one, supplies descriptive
guidance and may require populated **known module-field paths**. Its embedded
installed-contract descriptor exposes the supported structural slots, case
inputs, capabilities and limits.

That descriptor is not a complete standalone JSON Schema. A template cannot
inject executable validators, redefine the evaluator, introduce arbitrary field
paths or add a new modeling language. Guidance is descriptive; populated-field
restrictions are checked mechanically. A new computational pattern requires a
runtime capability, rather than a YAML workaround.

## Execution and conclusions are different

A successful calculation can establish an answer, leave it open, find
inconsistent records, or report invalid case values. An exit code or completed
worker is not a business conclusion.

A report also distinguishes **complete delivery** from **complete assessment**.
Its tables may fully explain why an interrupted calculation cannot establish an
answer. Cancellation and timeout do not manufacture an assessment; output-size
failure does not return a successful clipped report.

The report carries calculation provenance and the evaluated input. It does not
certify that supplied records are true, establish that a physical task happened,
or grant operating permission.

## Choose a starting point

- [Evidence review](patterns/evidence-review.md): what follows from a fixed record
  across its permitted explanations?
- [Learning value](patterns/learning-value.md): is an available learning option
  worth its cost compared with acting now?
- [Create a template](guides/create-a-template.md) and [create an app](guides/create-an-app.md).
- [Run and compare cases](guides/run-and-compare-cases.md).
- [Render reports](guides/render-reports.md) without the model or evaluator.
