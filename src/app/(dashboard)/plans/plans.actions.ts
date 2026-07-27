'use server'

import { createPlan, deletePlan, getPlan, listPlans, updatePlan } from '@/infrastructure/http/clients/plans.client'
import type { PlanFiltersParams, PlanInput } from '@/domain/dtos/plans.dto'

export async function listPlansAction(filters: PlanFiltersParams = {}) {
  return listPlans(filters)
}

export async function getPlanAction(id: number) {
  return getPlan(id)
}

export async function createPlanAction(input: PlanInput) {
  return createPlan(input)
}

export async function updatePlanAction(id: number, input: PlanInput) {
  return updatePlan(id, input)
}

export async function deletePlanAction(id: number) {
  return deletePlan(id)
}
