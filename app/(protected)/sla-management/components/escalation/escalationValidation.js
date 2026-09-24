/**
 * Client-side validation helper for Escalation Hierarchy.
 */

export const validateEscalationLadder = (levels, isEnabled = true, maxRetries = 2) => {
  const errors = [];

  // Validate max retries
  const retries = Number(maxRetries);
  if (isNaN(retries) || !Number.isInteger(retries) || retries < 0 || retries > 10) {
    errors.push("Max retry attempts must be a whole number between 0 and 10.");
  }

  if (!isEnabled) {
    return {
      isValid: errors.length === 0,
      errors,
      firstError: errors[0] || null,
    };
  }

  if (!Array.isArray(levels) || levels.length === 0) {
    errors.push("At least one escalation level is required when escalation is enabled.");
    return { isValid: false, errors, firstError: errors[0] };
  }

  if (levels.length > 10) {
    errors.push("Maximum of 10 escalation levels allowed.");
  }

  for (let i = 0; i < levels.length; i++) {
    const item = levels[i];

    if (!item.target_role || String(item.target_role).trim() === "") {
      errors.push(`Level ${i + 1} must have a selected target role.`);
    }

    const delay = Number(item.delay_minutes);
    if (isNaN(delay) || delay < 0 || !Number.isInteger(delay)) {
      errors.push(`Level ${i + 1} delay must be a non-negative whole number of minutes.`);
      continue;
    }

    if (i > 0) {
      const prevDelay = Number(levels[i - 1].delay_minutes);
      if (delay < prevDelay) {
        errors.push(
          `Level ${i + 1} delay (${delay}m) cannot be less than Level ${i} delay (${prevDelay}m). Escalation progression must be chronological.`
        );
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    firstError: errors[0] || null,
  };
};
