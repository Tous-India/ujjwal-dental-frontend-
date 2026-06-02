/**
 * Shared helpers for native <input type="date"> fields.
 *
 * - MAX_DATE caps the year to exactly 4 digits (prevents 5-digit years).
 * - todayStr() is the earliest selectable date for forward-looking pickers.
 * - dateGuards blocks arrow-key and mouse-wheel value changes, mirroring the
 *   hardening applied to numeric inputs elsewhere.
 */

// Year is capped at 4 digits by bounding the max selectable date.
export const MAX_DATE = "9999-12-31";

// Today as yyyy-mm-dd (used as the min for appointment date pickers).
export const todayStr = () => new Date().toISOString().split("T")[0];

// Prevent ArrowUp/ArrowDown and scroll wheel from mutating a date input.
export const dateGuards = {
  onKeyDown: (e) => {
    if (e.key === "ArrowUp" || e.key === "ArrowDown") e.preventDefault();
  },
  onWheel: (e) => e.currentTarget.blur(),
};
