import { z } from "zod";
import { UnitIdSchema } from "./semanticPrimitives.js";

export const TerminalDirectionSchema = z.enum(["input", "output", "bidirectional"]);
export const TerminalAllocationModeSchema = z.enum(["fixed", "priority", "proportional", "on_demand"]);
export const TerminalCriticalitySchema = z.enum(["low", "medium", "high", "critical"]);

export const TerminalFailureSemanticsSchema = z.object({
  behavior: z.enum(["fail_closed", "fail_open", "degrade", "buffer", "shed_load"]),
  description: z.string().min(1),
});

export const ModuleTerminalSchema = z
  .object({
    id: z.string().regex(/^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/),
    resourceType: z.string().min(1),
    unit: UnitIdSchema,
    timingModel: z.enum(["instant", "hourly", "daily", "monthly", "event"]),
    nominalCapacity: z.number().nonnegative(),
    peakCapacity: z.number().nonnegative(),
    qualityAttributes: z.array(z.string().min(1)).default([]),
    direction: TerminalDirectionSchema,
    allocationMode: TerminalAllocationModeSchema,
    spatialScope: z.string().min(1),
    criticality: TerminalCriticalitySchema,
    failureSemantics: TerminalFailureSemanticsSchema,
  })
  .superRefine((terminal, ctx) => {
    if (terminal.peakCapacity < terminal.nominalCapacity) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["peakCapacity"],
        message: "peakCapacity must be >= nominalCapacity",
      });
    }
  });

export type TerminalDirection = z.infer<typeof TerminalDirectionSchema>;
export type TerminalAllocationMode = z.infer<typeof TerminalAllocationModeSchema>;
export type TerminalCriticality = z.infer<typeof TerminalCriticalitySchema>;
export type ModuleTerminal = z.infer<typeof ModuleTerminalSchema>;
