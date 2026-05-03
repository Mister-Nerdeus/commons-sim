# Graph Contracts

Phase B defines graph skeletons only:

- `ProblemGraphSchema`
- `SolutionGraphSchema`
- `WorldGraphSchema`
- `GraphNodeSchema`
- `GraphEdgeSchema`
- `GraphLinkPatternSchema`

Link patterns:

- `direct connection`
- `bus`
- `allocator`
- `aggregator`
- `controller`
- `feedback loop`

Graph edge terminal references use the same semantic namespaced terminal id convention as module terminals, such as `food.meals_out` or `water.potable_in`.

Graph schemas verify that edge node references exist and that edge terminal references use valid semantic ids. They do not compile, schedule, execute, or migrate scenarios. Compiler behavior belongs to Phase C.
