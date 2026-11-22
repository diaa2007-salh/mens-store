import type { OrderStatus } from "@prisma/client";

export const orderTransitions = {
  PENDING: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["SHIPPED", "CANCELLED"],
  SHIPPED: ["DELIVERED", "CANCELLED"],
  DELIVERED: [],
  CANCELLED: [],
} as const satisfies Record<OrderStatus, readonly OrderStatus[]>;

export function canTransitionOrder(
  current: OrderStatus,
  next: OrderStatus,
): boolean {
  return (orderTransitions[current] as readonly OrderStatus[]).includes(next);
}

export function nextOrderStatuses(current: OrderStatus): readonly OrderStatus[] {
  return orderTransitions[current];
}
