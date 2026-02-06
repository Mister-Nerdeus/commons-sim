# MODEL (Phase 1)

## Units
- Time step: **monthly**
- Wages: USD/hour (fully loaded)
- Utilities:
  - electricity: USD/kWh
  - water: USD/gal
  - sewer: USD/gal

## Households and residents
We model:
- householdCount
- householdMix: singles, couples, families (must sum to householdCount)
- occupantsPerType: expected occupants per household type

ResidentCount = singles*singleOcc + couples*coupleOcc + families*familyOcc

## Services (Phase 1)
Services are modeled as **shared demand** multiplied by participation:
- Meals: mealsPerResidentPerDay * residents * participation.meals
- Laundry: loadsPerHouseholdPerWeek * participatingHouseholds * 4.345
- Cleaning: cleaningHoursPerHouseholdPerMonth * participatingHouseholds

Tiers:
- 0 none
- 1 basic
- 2 standard
- 3 premium

Tier changes default demand coefficients (simple and inspectable).

## Labor
Labor hours per month:
- Meals: (sharedMealsPerMonth / 120) * 8
- Laundry: laundryLoadsPerMonth * 0.15
- Cleaning: cleaningHours

Then:
- inefficiency drift: ±3% deterministic noise (seeded)
- overheadMultiplier accounts for admin/training/coordination/turnover

LaborCost = laborHours * fullyLoadedUsdPerHour

## Equipment
Annualized equipment cost:
- depreciation = capex / usefulLifeYears
- maintenance = annualMaintenanceUsd
Converted to monthly.

## Utilities (Phase 1 proxy)
Utilities are coarse planning proxies for now. They are intentionally conservative and will be replaced by calibrated submodels later.

## Outputs
- costPerHouseholdUsd (opex / householdCount)
- laborHours
- reserve trajectory
- burnoutIndex (placeholder proxy)

## Determinism
- All randomness is seeded.
- Snapshots are hashed with stable JSON output.
