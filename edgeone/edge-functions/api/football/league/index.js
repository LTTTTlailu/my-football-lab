import { competitionCodes, footballData, json } from "../_shared.js";

export async function onRequestGet({ request, env }) {
  const code = new URL(request.url).searchParams.get("code")?.toUpperCase() || "";

  if (!competitionCodes.has(code)) {
    return json({ error: "INVALID_COMPETITION" }, 400);
  }

  const response = await footballData(`/competitions/${code}/teams`, env);
  if (!response.ok) return response;

  const data = await response.json();
  return json(
    {
      competition: data.competition,
      season: data.season,
      teams: (data.teams || []).map((team) => ({
        id: team.id,
        name: team.name,
        shortName: team.shortName || team.name,
        tla: team.tla || "",
      })),
    },
    200,
    { "cache-control": "public, max-age=900, s-maxage=21600" }
  );
}
