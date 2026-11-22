import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { canTransitionOrder, nextOrderStatuses } from "../lib/order-state";

describe("order state transitions", () => {
  it("allows only the documented next states", () => {
    assert.deepEqual(nextOrderStatuses("PENDING"), ["CONFIRMED", "CANCELLED"]);
    assert.deepEqual(nextOrderStatuses("CONFIRMED"), ["SHIPPED", "CANCELLED"]);
    assert.deepEqual(nextOrderStatuses("SHIPPED"), ["DELIVERED", "CANCELLED"]);
  });

  it("keeps delivered and cancelled orders terminal", () => {
    assert.deepEqual(nextOrderStatuses("DELIVERED"), []);
    assert.deepEqual(nextOrderStatuses("CANCELLED"), []);
    assert.equal(canTransitionOrder("CANCELLED", "CONFIRMED"), false);
    assert.equal(canTransitionOrder("DELIVERED", "CANCELLED"), false);
  });
});
