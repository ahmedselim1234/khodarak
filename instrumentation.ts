export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    // Importing lib/env.server validates every required var (public +
    // service role) once, at process startup, so a missing/invalid value
    // fails immediately instead of surfacing later inside an unrelated
    // request (FR-006).
    await import("./lib/env.server");
  }
}
