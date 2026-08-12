import { describe, expect, it } from "vitest";
import { z } from "zod";
import { formatZodFieldErrors } from "@/lib/validation/formatZodError";

describe("formatZodFieldErrors", () => {
  const schema = z.object({
    nameAr: z.string().min(1, "الاسم مطلوب"),
    days: z.number().int().min(1, "غير صالح"),
  });

  it("returns a 400 response with a fields record keyed by the first path segment", async () => {
    const result = schema.safeParse({ nameAr: "", days: 0 });
    if (result.success) throw new Error("expected validation to fail");

    const response = formatZodFieldErrors(result.error);
    expect(response.status).toBe(400);

    const body = await response.json();
    expect(body).toEqual({
      error: "validation_failed",
      fields: { nameAr: "الاسم مطلوب", days: "غير صالح" },
    });
  });

  it("produces the same shape for a single-field failure", async () => {
    const result = schema.safeParse({ nameAr: "ok", days: -1 });
    if (result.success) throw new Error("expected validation to fail");

    const body = await formatZodFieldErrors(result.error).json();
    expect(body).toEqual({ error: "validation_failed", fields: { days: "غير صالح" } });
  });
});
