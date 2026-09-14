declare namespace Cloudflare {
  interface Env {
    DB?: D1Database;
    BUCKET?: R2Bucket;
    FOOTBALL_DATA_TOKEN?: string;
  }
}
