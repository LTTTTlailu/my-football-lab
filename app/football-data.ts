import { env } from "cloudflare:workers";

export const competitionCodes = new Set(["PL", "PD", "SA", "BL1", "FL1"]);

export async function footballData(path: string) {
  const token = env.FOOTBALL_DATA_TOKEN?.trim();

  if (!token) {
    return Response.json(
      { error: "FOOTBALL_DATA_NOT_CONFIGURED" },
      { status: 503 }
    );
  }

  const response = await fetch(`https://api.football-data.org/v4${path}`, {
    headers: { "X-Auth-Token": token },
  });

  if (!response.ok) {
    return Response.json(
      { error: "FOOTBALL_DATA_UNAVAILABLE", status: response.status },
      { status: response.status === 429 ? 429 : 502 }
    );
  }

  return response;
}
