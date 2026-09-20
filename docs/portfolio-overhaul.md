# Engineering portfolio overhaul

## Audit findings

- The old homepage led with digital-asset trading, while the requested audience is AI and forward-deployed engineering teams across finance, fintech, and crypto.
- Two overlapping focus lists, four equally weighted buttons, and a long sequence of detailed cards weakened the reading hierarchy.
- Agent Mode rendered a large JSON preview alongside human-facing work. It remains available through its dedicated surfaces and project page.
- The WebGL intro could trap a visitor behind a black overlay. Browser inspection reproduced a renderer initialization failure; Skip previously depended on the missing renderer.
- The site has useful integration and systems evidence, but its AI material is largely teaching labs and infrastructure tooling. Those should not be presented as client deployments.

## Implemented direction

Engineering leads the page, with institutional markets as domain credibility. Graphite and cool-white themes use a restrained blue accent, larger typography, a clearer work index, real project screenshots, and compact project archives. Four featured projects connect data integration, agent mechanics, financial simulation, and applied research. Existing routes, demos, project status, research, and resume access remain available.

The market visualization is opt-in, loaded separately, and fails open. The homepage, structured manifest, LLM router, social metadata, navigation, and contact positioning share the engineering focus. The homepage uses a shared featured-work configuration rather than duplicating project records.

## Evidence to develop next

The strongest additional case study would document a real user's workflow: the original problem, data sources and permissions, discovery decisions, deployment environment, evaluation cases, operational ownership, user feedback, and an observed result. A reconciliation assistant or source-grounded finance research workflow is a natural fit. Include measured outcomes only when supported by records.

RAMM.ai may provide relevant stakeholder and product-delivery evidence. Document the actual user's need, personal contribution, integration constraints, and what shipped before expanding it into a featured client case study. Do not infer usage, business impact, or production ownership from a project title.

## Review

Review the homepage in light and dark themes, narrow and wide layouts, expanded archives, project pages, resume access, agent endpoints, and the optional intro with WebGL unavailable. Publication to the production branch is separate from the review branch.
