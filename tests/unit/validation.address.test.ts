import { describe, expect, it } from "vitest";
import { addressCreateSchema, addressUpdateSchema } from "@/lib/validation/address";

const validCityId = "9d1e2b3c-1a2b-4c3d-8e9f-0a1b2c3d4e5f";

describe("addressCreateSchema", () => {
  const validInput = {
    label: "المنزل",
    cityId: validCityId,
    district: "حي العليا",
    streetDetails: "مبنى 12، شقة 3",
  };

  it("accepts a fully valid address payload", () => {
    expect(addressCreateSchema.safeParse(validInput).success).toBe(true);
  });

  it("rejects an empty label", () => {
    expect(addressCreateSchema.safeParse({ ...validInput, label: "" }).success).toBe(false);
  });

  it("rejects an empty district", () => {
    expect(addressCreateSchema.safeParse({ ...validInput, district: "" }).success).toBe(false);
  });

  it("rejects an empty streetDetails", () => {
    expect(
      addressCreateSchema.safeParse({ ...validInput, streetDetails: "" }).success
    ).toBe(false);
  });

  it("rejects an invalid cityId", () => {
    expect(addressCreateSchema.safeParse({ ...validInput, cityId: "not-a-uuid" }).success).toBe(
      false
    );
  });
});

describe("addressUpdateSchema", () => {
  it("accepts a partial update with a single field", () => {
    expect(addressUpdateSchema.safeParse({ label: "العمل" }).success).toBe(true);
  });

  it("accepts isDefault: true", () => {
    expect(addressUpdateSchema.safeParse({ isDefault: true }).success).toBe(true);
  });

  it("rejects isDefault: false (cannot un-default without designating a new default)", () => {
    expect(addressUpdateSchema.safeParse({ isDefault: false }).success).toBe(false);
  });

  it("rejects an empty payload", () => {
    expect(addressUpdateSchema.safeParse({}).success).toBe(false);
  });

  it("rejects an invalid cityId when provided", () => {
    expect(addressUpdateSchema.safeParse({ cityId: "not-a-uuid" }).success).toBe(false);
  });
});
