import { z } from "zod";

export const TimeSeriesPointSchema = z.object({
  monthIndex: z.number().int().nonnegative(),
  totalOpexUsd: z.number(),
  laborHours: z.number(),
  reserveUsd: z.number(),
  costPerHouseholdUsd: z.number(),
  burnoutIndex: z.number().min(0).max(1),
});

export const SimulationOutputSchema = z.object({
  scenarioId: z.string().min(1),
  horizonMonths: z.number().int().positive(),
  summary: z.object({
    avgCostPerHouseholdUsd: z.number(),
    avgLaborHoursPerMonth: z.number(),
    reserveEndUsd: z.number(),
    avgBurnoutIndex: z.number().min(0).max(1),
  }),
  series: z.array(TimeSeriesPointSchema),
  meta: z.object({
    modelVersion: z.string().min(1),
    assumptionSetVersion: z.string().min(1),
    engineVersion: z.string().min(1),
    seed: z.number().int().nonnegative(),
  }),
});

export type SimulationOutput = z.infer<typeof SimulationOutputSchema>;
