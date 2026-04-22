import type { IconType } from "react-icons";
import {
  SiVercel,
  SiNetlify,
  SiCloudflare,
  SiHeroku,
  SiRailway,
  SiRender,
  SiFlydotio,
  SiGooglecloud,
  SiDigitalocean,
  SiFirebase,
  SiSupabase,
  SiPlanetscale,
  SiMongodb,
  SiPostgresql,
  SiMysql,
  SiRedis,
  SiSqlite,
  SiDocker,
  SiReplit,
  SiGithub,
  SiGitlab,
  SiBitbucket,
  SiNotion,
  SiFigma,
  SiLinear,
  SiSlack,
  SiDiscord,
} from "react-icons/si";
import { VscAzure } from "react-icons/vsc";
import { Globe, Cloud } from "lucide-react";

export type PlatformCategory = "hosting" | "database" | "service" | "other";

export interface Platform {
  id: string;
  name: string;
  category: PlatformCategory;
  icon: IconType;
  color: string;
}

export const PLATFORMS: Platform[] = [
  // Hosting
  { id: "vercel", name: "Vercel", category: "hosting", icon: SiVercel, color: "#ffffff" },
  { id: "netlify", name: "Netlify", category: "hosting", icon: SiNetlify, color: "#00C7B7" },
  { id: "cloudflare", name: "Cloudflare", category: "hosting", icon: SiCloudflare, color: "#F38020" },
  { id: "heroku", name: "Heroku", category: "hosting", icon: SiHeroku, color: "#430098" },
  { id: "railway", name: "Railway", category: "hosting", icon: SiRailway, color: "#9089FC" },
  { id: "render", name: "Render", category: "hosting", icon: SiRender, color: "#46E3B7" },
  { id: "fly", name: "Fly.io", category: "hosting", icon: SiFlydotio, color: "#7B3FE4" },
  { id: "aws", name: "AWS", category: "hosting", icon: Cloud as unknown as IconType, color: "#FF9900" },
  { id: "gcp", name: "Google Cloud", category: "hosting", icon: SiGooglecloud, color: "#4285F4" },
  { id: "azure", name: "Azure", category: "hosting", icon: VscAzure, color: "#0078D4" },
  { id: "digitalocean", name: "DigitalOcean", category: "hosting", icon: SiDigitalocean, color: "#0080FF" },
  { id: "replit", name: "Replit", category: "hosting", icon: SiReplit, color: "#F26207" },

  // Databases
  { id: "supabase", name: "Supabase", category: "database", icon: SiSupabase, color: "#3ECF8E" },
  { id: "firebase", name: "Firebase", category: "database", icon: SiFirebase, color: "#FFCA28" },
  { id: "planetscale", name: "PlanetScale", category: "database", icon: SiPlanetscale, color: "#ffffff" },
  { id: "mongodb", name: "MongoDB Atlas", category: "database", icon: SiMongodb, color: "#47A248" },
  { id: "postgres", name: "PostgreSQL", category: "database", icon: SiPostgresql, color: "#4169E1" },
  { id: "mysql", name: "MySQL", category: "database", icon: SiMysql, color: "#4479A1" },
  { id: "redis", name: "Redis", category: "database", icon: SiRedis, color: "#DC382D" },
  { id: "sqlite", name: "SQLite", category: "database", icon: SiSqlite, color: "#003B57" },

  // Services
  { id: "docker", name: "Docker Hub", category: "service", icon: SiDocker, color: "#2496ED" },
  { id: "github", name: "GitHub", category: "service", icon: SiGithub, color: "#ffffff" },
  { id: "gitlab", name: "GitLab", category: "service", icon: SiGitlab, color: "#FC6D26" },
  { id: "bitbucket", name: "Bitbucket", category: "service", icon: SiBitbucket, color: "#0052CC" },
  { id: "notion", name: "Notion", category: "service", icon: SiNotion, color: "#ffffff" },
  { id: "figma", name: "Figma", category: "service", icon: SiFigma, color: "#F24E1E" },
  { id: "linear", name: "Linear", category: "service", icon: SiLinear, color: "#5E6AD2" },
  { id: "slack", name: "Slack", category: "service", icon: SiSlack, color: "#4A154B" },
  { id: "discord", name: "Discord", category: "service", icon: SiDiscord, color: "#5865F2" },

  // Other
  { id: "custom", name: "Custom / Other", category: "other", icon: Globe as unknown as IconType, color: "#94a3b8" },
];

export function getPlatform(id: string): Platform {
  return PLATFORMS.find((p) => p.id === id) ?? PLATFORMS[PLATFORMS.length - 1];
}

export const CATEGORY_LABELS: Record<PlatformCategory, string> = {
  hosting: "Hosting",
  database: "Database",
  service: "Service",
  other: "Other",
};
