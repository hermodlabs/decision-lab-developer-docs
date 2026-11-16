# Assess marble learning value

Choose a marble before the Day-2 deadline. A reviewed basis permits three possible heavy identities in the red bag. The supplied teaching assessment assigns each a probability of one third. Choosing the heavy marble pays 90 hypothetical USD; choosing either other marble pays −30. Declining pays zero.

Should the decision owner buy another comparison? The model compares the best choice now with declared studies, their fees and completion times, and complete responses to their observable reports. It uses risk-neutral expected money, explicit likelihoods, and the stated cash/deadline limits. It does not infer these probabilities from a count of evidence-compatible possibilities.

From the documentation repository's root, after installing dependencies:

```sh
node examples/marble-learning/sdk.mjs
sh examples/marble-learning/cli.sh
```

Read the complete results at:

- `.output/marble-learning/sdk.run.json`
- `.output/marble-learning/cli.run.json`

Both contain `decision-lab-run/1`, including every study, response context, declared sensitivity scenario, payoff-bar dataset with an acting-now reference, timeline, and input table. Use `run.report` to render reports. The small [expected summary](expected/summary.json) is a verification aid only.

With the supplied assumptions, choosing any marble now has expected payoff **10**. The **fast certified comparison** (`exact-fast`) yields net expected payoff **78**, after its fee of 12, giving an improvement of **68** over acting now. Its complete response selects the marble identified by the report. These are expected values under the declared premises, not guaranteed realized payments.

## Change the case

Edit [case.yaml](case.yaml), then rerun either quickstart. Case workers can revise the declared priors, payoffs, study fees and durations, action deadlines and cash requirements, accepted facts, and supported sensitivity scenarios. Changing a study's cost or whether it finishes before commitment can change the preferred option.

For example, increasing the `exact-fast` fee from `12` to `20` removes its eight-unit advantage over the next-best option and creates a tie. The supplied `exact-fast-price-tie` sensitivity scenario already illustrates this comparison. Other declared scenarios explore concentrated priors and bag-only payoffs.

The meaning of the objective, units, state/action/study identities, possible reports, and presentation bindings belongs to the module author and is frozen in [app.json](app.json). Editing [model.yaml](model.yaml) requires creating and reviewing a new app package; changing that file alone does not change what the quickstarts run.

## Recreate the app

```sh
node examples/marble-learning/author.mjs
sh examples/marble-learning/author.sh
```

The SDK writes the template/app definitions and packages plus default case inputs to `.output/marble-learning/authoring/sdk/`. The CLI writes equivalent artifacts and a complete run to `.output/marble-learning/authoring/cli/`. CLI validation receipts are printed to stdout.

CLI packages are immutable. Supply a fresh **absolute** output directory to repeat authoring:

```sh
sh examples/marble-learning/author.sh /absolute/path/to/new-learning-example
```

`node examples/verify.mjs` selects fresh directories and verifies exact app-package reproduction and complete SDK/CLI report equality. Authoring uses the installed learning-value pattern and its fixed mathematical criterion.

See [create an app](../../docs/guides/create-an-app.md), [run and compare cases](../../docs/guides/run-and-compare-cases.md), and [learning value](../../docs/patterns/learning-value.md).
