import type { ExpenseRepository } from '../domain/ports'

export function deleteExpense(repo: ExpenseRepository, id: string): void {
  repo.remove(id)
}
