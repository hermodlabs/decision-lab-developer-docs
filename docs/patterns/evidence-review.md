# Evidence review

**Pattern:** `evidence-review/1`  
**Installed evaluator:** `finite-relational-evidence/1`

The question is: **What does this fixed record establish under the declared
rules and assumptions?**

The module defines a finite space of possible explanations. The evaluator
generates those alternatives, derives their consequences, rules out alternatives
that fail the consistency checks, and assesses the declared questions over the
remaining alternatives.

## Marble example

Exactly one of nine listed marbles is heavier. Bags and weighing layouts are
supplied facts. A possible explanation identifies the heavy marble; rules predict
the resulting weighing outcomes. A consistency check permits at most the case's
declared number of incorrect reports across the entire record.

The two questions require different detail:

| Question | What would establish it? |
| --- | --- |
| Which bag contains the heavy marble? | Every remaining possibility identifies the same bag. |
| Which exact marble is heavy? | Every remaining possibility identifies the same marble. |

In the supplied baseline, three remaining identities all belong to the red bag.
The bag answer is established while the exact identity remains open. The app
does not need to resolve a finer question to establish the coarser one.

## What authors and case workers supply

| Module author publishes | Case worker supplies |
| --- | --- |
| Typed relation schemas and parameter declarations | Basis and evidence facts using those schemas; parameter values within bounds |
| Finite generation dimensions | The listed finite input domains used by generation |
| Relational derivation rules | Records from which the rules derive consequences |
| Admission and interpretation consistency checks | The inputs checked against those rules |
| Boolean, value or set question definitions | Which published question IDs to assess |
| Business labels, explanation groups and relationship views | Case identity, scope and optional lower evaluation bounds |

Generation, rule meaning and query definitions are fixed in a published app.
New observations or an allowed parameter change require a new case calculation;
a different rule requires a new app release.

## What the reports explain

The complete report contains findings for every requested question, remaining
and ruled-out possibilities, the answer in each retained explanation, configured
relation tables and relationship diagrams, submitted inputs, assumptions,
assessment checks, evaluation coverage and changes when prior context is given.

An established answer requires a nonempty admissible basis and a completed
counterexample check. Different admissible answers demonstrate that a question
is open, even if enumeration is unfinished. An empty interrupted search does not
establish that the record is inconsistent. A Boolean `false` can be a valid
established answer.

## Fit and limits

Use this pattern for explicit finite alternatives and reviewed relational rules:
for example, checking evidence-compatible faults or tracing relationships under
stated assumptions. Its language supports finite subsets, joins, positive
recursion, stratified negation/count, and bounded arithmetic comparisons.

This is not a probabilistic model. Counts of explanations do not supply
probabilities, entropy or expected learning value. The pattern does not establish
global identifiability across every hypothetical record, guarantee minimal
conflict explanations, or execute arbitrary authored code.

The result is relative to the supplied finite model and record. It does not
authenticate physical observations or authorize a response.

Start with the [marble evidence example](../../examples/marble-evidence/README.md),
or [create an app](../guides/create-an-app.md).
