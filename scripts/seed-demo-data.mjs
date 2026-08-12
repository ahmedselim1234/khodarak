// Seeds realistic demo/test data into a connected Supabase project:
// products (with real images uploaded to the product-images storage
// bucket), a couple of extra cities, an admin account, and a few demo
// customer accounts with saved addresses. Idempotent — safe to re-run;
// existing rows/users are matched by name/email and updated rather than
// duplicated. Uses the service-role key (bypasses RLS, same as every other
// privileged write in this codebase) — never modifies any RLS policy.
//
// Usage: node scripts/seed-demo-data.mjs
// Requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in the
// environment (.env.local already has both).

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));

function loadEnvLocal() {
  try {
    const content = readFileSync(join(__dirname, "..", ".env.local"), "utf-8");
    for (const line of content.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      const value = trimmed.slice(eq + 1).trim();
      if (!(key in process.env)) process.env[key] = value;
    }
  } catch {
    // .env.local not found — rely on already-exported env vars
  }
}

loadEnvLocal();

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const PRODUCTS = [
  { slug: "tomato", nameAr: "طماطم بلدي", category: "vegetables", price: 8.5, unit: "kg", minQty: 1, maxQty: 20, sortOrder: 10, unsplash: "1546094096-0df4bcaaa337" },
  { slug: "cucumber", nameAr: "خيار طازج", category: "vegetables", price: 5.0, unit: "kg", minQty: 1, maxQty: 20, sortOrder: 20, unsplash: "1449300079323-02e209d9d3a6" },
  { slug: "carrot", nameAr: "جزر", category: "vegetables", price: 4.5, unit: "kg", minQty: 1, maxQty: 20, sortOrder: 30, unsplash: "1447175008436-054170c2e979" },
  { slug: "potato", nameAr: "بطاطس", category: "vegetables", price: 4.0, unit: "kg", minQty: 1, maxQty: 20, sortOrder: 40, unsplash: "1518977676601-b53f82aba655" },
  { slug: "onion", nameAr: "بصل أحمر", category: "vegetables", price: 3.5, unit: "kg", minQty: 1, maxQty: 20, sortOrder: 50, unsplash: "1618512496248-a07fe83aa8cb" },
  { slug: "bell-pepper", nameAr: "فلفل حلو ملون", category: "vegetables", price: 12.0, unit: "kg", minQty: 1, maxQty: 10, sortOrder: 60, unsplash: "1563565375-f3fdfdbefa83" },
  { slug: "spinach", nameAr: "سبانخ طازجة", category: "vegetables", price: 6.0, unit: "kg", minQty: 1, maxQty: 10, sortOrder: 70, unsplash: "1576045057995-568f588f82fb" },
  { slug: "garlic", nameAr: "ثوم", category: "vegetables", price: 18.0, unit: "kg", minQty: 1, maxQty: 5, sortOrder: 80, unsplash: "1540148426945-6cf22a6b2383" },
  { slug: "mint", nameAr: "نعناع طازج", category: "vegetables", price: 2.5, unit: "piece", minQty: 1, maxQty: 10, sortOrder: 90, unsplash: "1628556270448-4d4e4148e1b1" },
  { slug: "apple", nameAr: "تفاح أحمر", category: "fruits", price: 9.0, unit: "kg", minQty: 1, maxQty: 20, sortOrder: 100, unsplash: "1560806887-1e4cd0b6cbd6" },
  { slug: "banana", nameAr: "موز", category: "fruits", price: 6.5, unit: "kg", minQty: 1, maxQty: 20, sortOrder: 110, unsplash: "1571771894821-ce9b6c11b08e" },
  { slug: "orange", nameAr: "برتقال", category: "fruits", price: 7.0, unit: "kg", minQty: 1, maxQty: 20, sortOrder: 120, unsplash: "1547514701-42782101795e" },
  { slug: "grape", nameAr: "عنب أسود", category: "fruits", price: 14.0, unit: "kg", minQty: 1, maxQty: 10, sortOrder: 130, unsplash: "1596363505729-4190a9506133" },
  { slug: "strawberry", nameAr: "فراولة", category: "fruits", price: 15.0, unit: "piece", minQty: 1, maxQty: 10, sortOrder: 140, unsplash: "1518635017498-87f514b751ba" },
  { slug: "watermelon", nameAr: "بطيخ", category: "fruits", price: 20.0, unit: "piece", minQty: 1, maxQty: 5, sortOrder: 150, unsplash: "1587049352846-4a222e784d38" },
  { slug: "mango", nameAr: "مانجو", category: "fruits", price: 16.0, unit: "kg", minQty: 1, maxQty: 10, sortOrder: 160, unsplash: "1591073113125-e46713c829ed" },
  { slug: "lemon", nameAr: "ليمون", category: "fruits", price: 6.0, unit: "kg", minQty: 1, maxQty: 10, sortOrder: 170, unsplash: "1590502593747-42a996133562" },
  { slug: "pomegranate", nameAr: "رمان", category: "fruits", price: 13.0, unit: "kg", minQty: 1, maxQty: 10, sortOrder: 180, unsplash: "1541344999736-83eca272f6fc" },
];

const CITIES = ["الرياض", "جدة", "الدمام"];

const ADMIN_EMAIL = "admin@khodarak.sa";
const ADMIN_PASSWORD = "Khodarak@Admin2026";
const ADMIN_FULL_NAME = "مدير خضارك";
const ADMIN_PHONE = "0500000001";

const DEMO_CUSTOMERS = [
  {
    email: "sara.customer@khodarak.sa",
    password: "Khodarak@Demo2026",
    fullName: "سارة العتيبي",
    phone: "0500000002",
    city: "الرياض",
    label: "المنزل",
    district: "حي النرجس",
    streetDetails: "شارع الأمير سلطان، فيلا 12",
  },
  {
    email: "mohammed.customer@khodarak.sa",
    password: "Khodarak@Demo2026",
    fullName: "محمد القحطاني",
    phone: "0500000003",
    city: "جدة",
    label: "العمل",
    district: "حي الروضة",
    streetDetails: "طريق الملك عبدالله، برج الأعمال، الطابق 4",
  },
];

async function uploadProductImage(slug, unsplashId) {
  const sourceUrl = `https://images.unsplash.com/photo-${unsplashId}?w=1200&q=80`;
  const res = await fetch(sourceUrl);
  if (!res.ok) throw new Error(`image fetch failed for ${slug}: HTTP ${res.status}`);
  const buffer = Buffer.from(await res.arrayBuffer());
  const objectPath = `${slug}.jpg`;
  const { error } = await supabase.storage
    .from("product-images")
    .upload(objectPath, buffer, { contentType: "image/jpeg", upsert: true });
  if (error) throw error;
  const { data } = supabase.storage.from("product-images").getPublicUrl(objectPath);
  return data.publicUrl;
}

async function seedProducts() {
  console.log(`Seeding ${PRODUCTS.length} products...`);
  for (const p of PRODUCTS) {
    const imageUrl = await uploadProductImage(p.slug, p.unsplash);

    const { data: existing } = await supabase
      .from("products")
      .select("id")
      .eq("name_ar", p.nameAr)
      .maybeSingle();

    const row = {
      name_ar: p.nameAr,
      category: p.category,
      price: p.price,
      unit: p.unit,
      image_url: imageUrl,
      is_available: true,
      min_qty: p.minQty,
      max_qty: p.maxQty,
      sort_order: p.sortOrder,
    };

    if (existing) {
      const { error } = await supabase.from("products").update(row).eq("id", existing.id);
      if (error) throw error;
      console.log(`  updated: ${p.nameAr}`);
    } else {
      const { error } = await supabase.from("products").insert(row);
      if (error) throw error;
      console.log(`  created: ${p.nameAr}`);
    }
  }
}

async function seedCities() {
  console.log("Seeding cities...");
  const cityIds = {};
  const { data: allExisting } = await supabase.from("cities").select("id, name_ar");
  for (const row of allExisting ?? []) cityIds[row.name_ar] = row.id;

  for (const nameAr of CITIES) {
    if (cityIds[nameAr]) continue;
    const { data, error } = await supabase
      .from("cities")
      .insert({ name_ar: nameAr, is_active: true })
      .select("id")
      .single();
    if (error) throw error;
    cityIds[nameAr] = data.id;
    console.log(`  created: ${nameAr}`);
  }
  return cityIds;
}

async function findUserByEmail(email) {
  let page = 1;
  const perPage = 200;
  for (;;) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage });
    if (error) throw error;
    const match = data.users.find((u) => u.email === email);
    if (match) return match;
    if (data.users.length < perPage) return null;
    page += 1;
  }
}

async function ensureUser({ email, password, fullName, phone }) {
  let user = await findUserByEmail(email);
  if (!user) {
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName, phone },
    });
    if (error) throw error;
    user = data.user;
    console.log(`  created auth user: ${email}`);
  } else {
    console.log(`  auth user already exists: ${email}`);
  }
  return user;
}

async function seedAdmin() {
  console.log("Seeding admin account...");
  const user = await ensureUser({
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
    fullName: ADMIN_FULL_NAME,
    phone: ADMIN_PHONE,
  });

  const { error } = await supabase
    .from("profiles")
    .update({ role: "admin", full_name: ADMIN_FULL_NAME, phone: ADMIN_PHONE })
    .eq("id", user.id);
  if (error) throw error;
  console.log("  role set to admin");
}

async function seedDemoCustomers(cityIds) {
  console.log("Seeding demo customer accounts...");
  for (const c of DEMO_CUSTOMERS) {
    const user = await ensureUser({
      email: c.email,
      password: c.password,
      fullName: c.fullName,
      phone: c.phone,
    });

    const cityId = cityIds[c.city];
    if (!cityId) {
      console.warn(`  skipping address for ${c.email}: city "${c.city}" not found`);
      continue;
    }

    const { data: existingAddress } = await supabase
      .from("addresses")
      .select("id")
      .eq("user_id", user.id)
      .eq("label", c.label)
      .maybeSingle();

    if (!existingAddress) {
      const { error } = await supabase.from("addresses").insert({
        user_id: user.id,
        label: c.label,
        city_id: cityId,
        district: c.district,
        street_details: c.streetDetails,
        is_default: true,
      });
      if (error) throw error;
      console.log(`  created address for ${c.email}`);
    } else {
      console.log(`  address already exists for ${c.email}`);
    }
  }
}

async function verify() {
  console.log("\nVerifying...");
  const { data: products, error: productsError } = await supabase
    .from("products")
    .select("id, name_ar, image_url")
    .order("sort_order");
  if (productsError) throw productsError;
  console.log(`  products in DB: ${products.length}`);

  let brokenImages = 0;
  for (const p of products) {
    const res = await fetch(p.image_url, { method: "HEAD" });
    if (!res.ok) {
      brokenImages += 1;
      console.warn(`  BROKEN IMAGE (${res.status}): ${p.name_ar} -> ${p.image_url}`);
    }
  }
  console.log(`  broken images: ${brokenImages}`);

  const { data: cities } = await supabase.from("cities").select("name_ar");
  console.log(`  cities in DB: ${(cities ?? []).map((c) => c.name_ar).join("، ")}`);
}

async function main() {
  await seedProducts();
  const cityIds = await seedCities();
  await seedAdmin();
  await seedDemoCustomers(cityIds);
  await verify();

  console.log("\nDone.");
  console.log(`Admin login  -> email: ${ADMIN_EMAIL}  password: ${ADMIN_PASSWORD}`);
  for (const c of DEMO_CUSTOMERS) {
    console.log(`Demo customer -> email: ${c.email}  password: ${c.password}`);
  }
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
