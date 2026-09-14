import { competitionCodes, footballData } from "../../../football-data";

export async function GET(request: Request) {
  const code = new URL(request.url).searchParams.get("code")?.toUpperCase() ?? "";

  if (!competitionCodes.has(code)) {
    return Response.json({ error: "INVALID_COMPETITION" }, { status: 400 });
  }

  const response = await footballData(`/competitions/${code}/teams`);
  if (!response.ok) return response;

  const data = (await response.json()) as {
    competition?: { id?: number; name?: string; code?: string };
    season?: { startDate?: string; endDate?: string };
    teams?: Array<{
      id: number;
      name: string;
      shortName?: string;
      tla?: string;
    }>;
  };

  return Response.json(
    {
      competition: data.competition,
      season: data.season,
      teams: (data.teams ?? []).map((team) => ({
        id: team.id,
        name: team.name,
        shortName: team.shortName || team.name,
        tla: team.tla || "",
      })),
    },
    { headers: { "cache-control": "public, max-age=900, s-maxage=21600" } }
  );
}
