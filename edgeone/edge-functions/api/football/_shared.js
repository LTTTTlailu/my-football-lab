export const competitionCodes = new Set(["PL", "PD", "SA", "BL1", "FL1"]);

export function json(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      ...headers,
    },
  });
}

export async function footballData(path, env) {
  const token = String(env?.FOOTBALL_DATA_TOKEN || "").trim();

  if (!token) {
    return json({ error: "FOOTBALL_DATA_NOT_CONFIGURED" }, 503);
  }

  const response = await fetch(`https://api.football-data.org/v4${path}`, {
    headers: { "X-Auth-Token": token },
  });

  if (!response.ok) {
    return json(
      { error: "FOOTBALL_DATA_UNAVAILABLE", status: response.status },
      response.status === 429 ? 429 : 502
    );
  }

  return response;
}
