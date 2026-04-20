import { z } from "zod";
import { ScenarioSchema } from "./scenarioSchema.js";

export const ProjectManifestSchema = z.object({
  manifestVersion: z.literal(1),
  projectId: z.string().min(1),
  projectTitle: z.string().min(1),
  createdAtUtc: z.string().min(1),
  updatedAtUtc: z.string().min(1),
  sourceBranch: z.enum(["develop", "staging", "main"]).default("develop"),
  scenario: ScenarioSchema,
  metadata: z
    .object({
      notes: z.string().default(""),
      engineVersion: z.string().default("0.1.0"),
    })
    .default({ notes: "", engineVersion: "0.1.0" }),
});

export type ProjectManifest = z.infer<typeof ProjectManifestSchema>;
