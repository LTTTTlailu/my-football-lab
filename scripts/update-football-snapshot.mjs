import { readFile, rm, mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const outputDir = resolve(projectRoot, "public/data/football");
const competitions = ["PL", "PD", "SA", "BL1", "FL1"];

async function readLocalToken() {
  try {
    const contents = await readFile(resolve(projectRoot, ".dev.vars"), "utf8");
    const row = contents.split(/\r?\n/).find((line) => line.startsWith("FOOTBALL_DATA_TOKEN="));
    return row?.slice("FOOTBALL_DATA_TOKEN=".length).trim() || "";
  } catch {
    return "";
  }
}

const token = process.env.FOOTBALL_DATA_TOKEN?.trim() || (await readLocalToken());
if (!token) throw new Error("FOOTBALL_DATA_TOKEN is required");

const wait = (milliseconds) => new Promise((resolveWait) => setTimeout(resolveWait, milliseconds));
let requestCount = 0;

async function footballData(path) {
  if (requestCount > 0) await wait(6500);
  requestCount += 1;
  const response = await fetch(`https://api.football-data.org/v4${path}`, {
    headers: { "X-Auth-Token": token },
  });
  if (!response.ok) throw new Error(`${path} returned ${response.status}`);
  return response.json();
}

function nextMatch(match) {
  return {
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
  };
}

await rm(outputDir, { recursive: true, force: true });
await mkdir(resolve(outputDir, "leagues"), { recursive: true });
await mkdir(resolve(outputDir, "next"), { recursive: true });

for (const code of competitions) {
  const teamsData = await footballData(`/competitions/${code}/teams`);
  const teams = (teamsData.teams || []).map((team) => ({
    id: team.id,
    name: team.name,
    shortName: team.shortName || team.name,
    tla: team.tla || "",
  }));
  await writeFile(
    resolve(outputDir, "leagues", `${code}.json`),
    JSON.stringify({ competition: teamsData.competition, season: teamsData.season, teams })
  );

  const matchesData = await footballData(`/competitions/${code}/matches?status=SCHEDULED`);
  const upcoming = [...(matchesData.matches || [])].sort((a, b) => a.utcDate.localeCompare(b.utcDate));
  const byTeam = new Map();
  for (const match of upcoming) {
    for (const team of [match.homeTeam, match.awayTeam]) {
      if (team?.id && !byTeam.has(team.id)) byTeam.set(team.id, nextMatch(match));
    }
  }
  for (const team of teams) {
    await writeFile(
      resolve(outputDir, "next", `${team.id}.json`),
      JSON.stringify({ match: byTeam.get(team.id) || null })
    );
  }
  console.log(`Updated ${code}: ${teams.length} teams`);
}

await writeFile(
  resolve(outputDir, "updated.json"),
  JSON.stringify({ updatedAt: new Date().toISOString(), competitions })
);
