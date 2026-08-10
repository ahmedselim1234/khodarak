import { describe, expect, it } from "vitest";
import { productCreateSchema, productUpdateSchema } from "@/lib/validation/product";

const validInput = {
  nameAr: "طماطم عضوية طازجة",
  category: "vegetables" as const,
  price: 12.5,
  unit: "kg" as const,
  imageUrl: "https://example.supabase.co/storage/v1/object/public/product-images/tomato.jpg",
  minQty: 1,
  maxQty: 10,
};

describe("productCreateSchema", () => {
  it("accepts a fully valid product payload", () => {
    expect(productCreateSchema.safeParse(validInput).success).toBe(true);
  });

  it("rejects an invalid category", () => {
    expect(
      productCreateSchema.safeParse({ ...validInput, category: "grains" }).success
    ).toBe(false);
  });

  it("rejects an invalid unit", () => {
    expect(productCreateSchema.safeParse({ ...validInput, unit: "box" }).success).toBe(false);
  });

  it("rejects a non-positive price", () => {
    expect(productCreateSchema.safeParse({ ...validInput, price: 0 }).success).toBe(false);
    expect(productCreateSchema.safeParse({ ...validInput, price: -5 }).success).toBe(false);
  });

  it("rejects minQty greater than maxQty", () => {
    expect(
      productCreateSchema.safeParse({ ...validInput, minQty: 5, maxQty: 2 }).success
    ).toBe(false);
  });

  it("rejects a missing/empty imageUrl", () => {
    expect(productCreateSchema.safeParse({ ...validInput, imageUrl: "" }).success).toBe(false);
    const withoutImage: Record<string, unknown> = { ...validInput };
    delete withoutImage.imageUrl;
    expect(productCreateSchema.safeParse(withoutImage).success).toBe(false);
  });
});

describe("productUpdateSchema", () => {
  it("accepts a partial update with a single field", () => {
    expect(productUpdateSchema.safeParse({ price: 15 }).success).toBe(true);
  });

  it("accepts an availability-only toggle", () => {
    expect(productUpdateSchema.safeParse({ isAvailable: false }).success).toBe(true);
  });

  it("rejects an empty payload", () => {
    expect(productUpdateSchema.safeParse({}).success).toBe(false);
  });

  it("rejects minQty greater than maxQty when both are provided", () => {
    expect(productUpdateSchema.safeParse({ minQty: 8, maxQty: 3 }).success).toBe(false);
  });

  it("accepts a minQty-only update (no maxQty to conflict with)", () => {
    expect(productUpdateSchema.safeParse({ minQty: 2 }).success).toBe(true);
  });
});
