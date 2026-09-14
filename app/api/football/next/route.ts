import { footballData } from "../../../football-data";

export async function GET(request: Request) {
  const teamId = new URL(request.url).searchParams.get("teamId") ?? "";

  if (!/^\d+$/.test(teamId)) {
    return Response.json({ error: "INVALID_TEAM" }, { status: 400 });
  }

  const response = await footballData(`/teams/${teamId}/matches?status=SCHEDULED&limit=1`);
  if (!response.ok) return response;

  const data = (await response.json()) as {
    matches?: Array<{
      id: number;
      utcDate: string;
      status: string;
      matchday?: number;
      competition?: { name?: string; code?: string };
      homeTeam: { id: number; name: string; shortName?: string };
      awayTeam: { id: number; name: string; shortName?: string };
    }>;
  };

  const match = data.matches?.[0];
  return Response.json(
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
    { headers: { "cache-control": "public, max-age=300, s-maxage=1800" } }
  );
}
