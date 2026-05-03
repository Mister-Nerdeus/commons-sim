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

Graph schemas verify that edge node references exist. They do not compile, schedule, execute, or migrate scenarios. Compiler behavior belongs to Phase C.
