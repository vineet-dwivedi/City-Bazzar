// Input helpers keep route parsing short and consistent.
import { badRequest } from "./api-error.js";

export const requiredString = (value: unknown, field: string) => {
  const text = String(value ?? "").trim();

  if (!text) {
    throw badRequest(`${field} is required.`);
  }

  return text;
};

export const optionalString = (value: unknown) => {
  if (value === undefined || value === null) {
    return undefined;
  }

  const text = String(value).trim();
  return text || undefined;
};

export const requiredNumber = (value: unknown, field: string) => {
  const number = Number(value);

  if (Number.isNaN(number)) {
    throw badRequest(`${field} must be a valid number.`);
  }

  return number;
};

export const optionalNumber = (value: unknown, field: string) => {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }

  return requiredNumber(value, field);
};

export const stringList = (value: unknown) =>
  Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string" && item.trim().length > 0)
    : [];
