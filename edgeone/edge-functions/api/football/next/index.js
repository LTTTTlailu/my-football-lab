import { footballData, json } from "../_shared.js";

export async function onRequestGet({ request, env }) {
  const teamId = new URL(request.url).searchParams.get("teamId") || "";

  if (!/^\d+$/.test(teamId)) {
    return json({ error: "INVALID_TEAM" }, 400);
  }

  const response = await footballData(`/teams/${teamId}/matches?status=SCHEDULED&limit=1`, env);
  if (!response.ok) return response;

  const data = await response.json();
  const match = data.matches?.[0];

  return json(
    {
      match: match
        ? {
            id: match.id,
            utcDate: match.utcDate,
            status: match.status,
            matchday: match.matchday,
            competition: match.competition,
            homeTeam: {
              id: match.homeTeam.id,
              name: match.homeTeam.name,
              shortName: match.homeTeam.shortName || match.homeTeam.name,
            },
            awayTeam: {
              id: match.awayTeam.id,
              name: match.awayTeam.name,
              shortName: match.awayTeam.shortName || match.awayTeam.name,
            },
          }
        : null,
    },
    200,
    { "cache-control": "public, max-age=300, s-maxage=1800" }
  );
}
