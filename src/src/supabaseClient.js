import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://ujcheuhqnmbvecunrcbl.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_3v0NSK-vuRjpNMjkOfEpmw_3j5Zt5U7";

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

// One random id per browser, used to stop a browser voting twice on the
// same Mission Impossible entry. Not a source of truth (mi_votes has a
// DB-level unique constraint too) — just a friendly client-side signal.
export function getVoterId() {
  let id = localStorage.getItem("posted_voter_id");
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem("posted_voter_id", id);
  }
  return id;
}
