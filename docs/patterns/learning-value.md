# Assess the value of learning

**Pattern:** `assess-value-of-learning/1`  
**Installed evaluator:** `finite-learning-value/1`

The question is: **Is a proposed learning option worth its cost compared with
the best action available now?**

The calculation uses a finite set of hidden states, possible actions and
observable study reports. It compares acting now with a study followed by a
response to its actual report, under explicit probabilities, payoffs, fees,
budgets and timing.

## Marble example

The learning app starts with a reviewed set of three possible heavy identities
in the red bag. It does not rerun the separate historical evidence review. The
case supplies a probability assessment over those identities and payoffs for
choosing each marble.

Available studies differ in what they report, reliability, fee and completion
time. A report might identify the heavy marble, distinguish only one candidate,
be noisy or fail to arrive. The study is valuable only to the extent that its
observable result supports a better available action after accounting for cost.

If payoffs depend only on choosing the containing bag, resolving the exact
identity may add no decision value. If an otherwise useful result arrives after
the relevant actions expire, its information does not restore those actions.

## What is structural and what varies

| Module author publishes | Case worker supplies |
| --- | --- |
| Beneficiary, units, horizon and risk-neutral expected-money objective | Case scope and current relative time |
| Hidden-state identities and their typed attributes | Explicit prior probabilities and their stated basis |
| Action identities and meanings | State/action payoffs, cash requirements and deadlines |
| Study identities and all observable report identities | Fees, durations and every state/report likelihood, including zeros |
| Typed accepted-fact attributes | Explicit accepted facts and their sources |
| Optional reference-record schemas and basis/report groups | Reference records and declared sensitivity scenarios |

Adding a new action or study identity changes the published structure. Changing
the fee or likelihoods of a declared study changes a case input. A case cannot
substitute a different objective function.

## Interpret the comparison

The report presents the best available action now, study alternatives, expected
operating values, fees, net values, gains over acting now, ties and availability
reasons. It includes response choices and posteriors for every report branch,
perfect-information comparisons, declared sensitivity scenarios, timing views,
the supplied basis and case changes.

Responses depend on **observable reports**, never on secretly knowing the hidden
state. Fees are subtracted once from expected operating payoff and consume cash.
The response comparison respects modeled cash and deadline availability.

Payoff bars include an acting-now benchmark when that value is established.
Timelines show modeled result readiness and action deadlines. Neither chart
claims a realized payoff or completed physical work. Impossible reports and
zero-probability branches retain explicit unavailable results rather than
invented posteriors.

Pure information value is reported only when the feasible action set is
unchanged. When delay or cost changes what can be done, interpret the result as
the declared complete study-and-response alternative, with its qualifications.

## Fit and limits

Use this pattern when probabilities and monetary consequences can be explicitly
reviewed, the decision has finite actions and states, and one optional learning
study can precede the final response. It supports declared sensitivity scenarios;
it does not search every possible experiment or create an arbitrary sequential
learning program.

Probabilities are supplied assessments. The runtime does not infer them from
counts of compatible explanations or from a historical bound on reporting
errors. Reference records remain reference records until a person explicitly
declares an accepted fact. The installed objective is risk-neutral expected
money; arbitrary utility functions, inferred probabilities and executable
authored code are outside this pattern.

An economically preferred option is conditional on those inputs. It does not
establish a factual state, guarantee a payoff or grant operating permission.

Start with the [marble learning example](../../examples/marble-learning/README.md).
The [run and compare guide](../guides/run-and-compare-cases.md) uses the evidence
example, but its package/case/run/comparison workflow is the same for this
pattern. Keep the learning app and its own case paired when adapting commands.
