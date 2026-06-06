import crypto from "node:crypto";

export function buildArtifactUris(order) {
  const serializedOrder = stableStringify(order);
  const criteriaHash = sha256(stableStringify(order.selectedCriteria));
  const orderHash = sha256(serializedOrder);
  const taskHash = sha256(stableStringify(order.taskSpec));

  return {
    taskURI: `memory://tasks/${taskHash}`,
    orderURI: `memory://orders/${orderHash}`,
    criteriaHash: `0x${criteriaHash}`,
    serializedOrder
  };
}

export function sha256(value) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

function stableStringify(value) {
  return JSON.stringify(sortKeys(value));
}

function sortKeys(value) {
  if (Array.isArray(value)) {
    return value.map(sortKeys);
  }
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, nestedValue]) => [key, sortKeys(nestedValue)])
    );
  }
  return value;
}
