import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";

/**
 * Engineering note:
 * - Everything that changes outcomes must be explicit in the scenario.
 * - Defaults are allowed, but must be deterministic and documented.
 * - Keep numbers in consistent units (docs/MODEL.md).
 */

export const HouseholdMixSchema = z.object({
  // counts must sum to householdCount at validation time in ScenarioSchema refine
  singles: z.number().int().nonnegative(),
  couples: z.number().int().nonnegative(),
  families: z.number().int().nonnegative(),
});

export const UtilityPricesSchema = z.object({
  // USD per unit
  electricity_kwh: z.number().nonnegative(),
  water_gal: z.number().nonnegative(),
  sewer_gal: z.number().nonnegative(),
  gas_therm: z.number().nonnegative().optional(),
});

export const WageModelSchema = z.object({
  // blended fully-loaded cost per hour (wage + payroll burden + benefits)
  fullyLoadedUsdPerHour: z.number().positive(),
  // staffing friction (nonproductive time): training, turnover, meetings, admin
  overheadMultiplier: z.number().min(1).max(3).default(1.15),
});

export const ParticipationSchema = z.object({
  // fraction [0..1] of households participating in each shared service
  meals: z.number().min(0).max(1),
  laundry: z.number().min(0).max(1),
  cleaning: z.number().min(0).max(1),
});

export const ServiceTierSchema = z.object({
  // 0=none, 1=basic, 2=standard, 3=premium (kept simple for Phase 1)
  meals: z.number().int().min(0).max(3),
  laundry: z.number().int().min(0).max(3),
  cleaning: z.number().int().min(0).max(3),
});

export const EquipmentItemSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  category: z.enum(["kitchen", "laundry", "cleaning", "utilities", "other"]),
  capexUsd: z.number().nonnegative(),
  usefulLifeYears: z.number().positive(),
  annualMaintenanceUsd: z.number().nonnegative(),
});

export const ScenarioSchema = z
  .object({
    version: z.literal(1),
    id: z.string().min(1),
    title: z.string().min(1),

    seed: z.number().int().min(0).max(2 ** 31 - 1).default(1),

    horizonMonths: z.number().int().min(1).max(240).default(60),
    timestep: z.enum(["month"]).default("month"),

    householdCount: z.number().int().min(1).max(5000),
    householdMix: HouseholdMixSchema,

    // For Phase 1, we model “resident load” as expected occupants per household type.
    occupantsPerType: z.object({
      single: z.number().positive().default(1),
      couple: z.number().positive().default(2),
      family: z.number().positive().default(4.5),
    }),

    participation: ParticipationSchema,
    serviceTiers: ServiceTierSchema,

    wageModel: WageModelSchema,
    utilities: UtilityPricesSchema,

    equipment: z.array(EquipmentItemSchema).default([]),

    // reserves / governance levers
    reservePolicy: z.object({
      initialReserveUsd: z.number().nonnegative().default(0),
      targetMonthsOfOpex: z.number().nonnegative().default(3),
      maxReserveUsd: z.number().nonnegative().default(250000),
    }),
  })
  .superRefine((s, ctx) => {
    const sum = s.householdMix.singles + s.householdMix.couples + s.householdMix.families;
    if (sum !== s.householdCount) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `householdMix must sum to householdCount (${sum} != ${s.householdCount})`,
        path: ["householdMix"],
      });
    }
  });

export type Scenario = z.infer<typeof ScenarioSchema>;

export function exportScenarioJsonSchema() {
  return zodToJsonSchema(ScenarioSchema, {
    name: "ScenarioSchemaV1",
  });
}
