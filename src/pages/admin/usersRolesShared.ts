import type {
  AdminRole,
  AdminUser,
  BadgeTone,
  Organisation,
  UserStatus,
} from "./adminData";

export const PAGE_SIZE = 8;

export const STATUS_TONE: Record<UserStatus, BadgeTone> = {
  active: "green",
  invited: "amber",
  suspended: "red",
};

export const TONES: BadgeTone[] = [
  "green",
  "blue",
  "amber",
  "violet",
  "slate",
];

export type UserDraft = Omit<AdminUser, "id" | "createdAt" | "lastLogin">;

export type UserSaveMeta = { detail?: string; actionKey?: string };

export function normalize(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export function userMatches(
  user: AdminUser,
  query: string,
  role: AdminRole | undefined,
  org: Organisation | undefined,
): boolean {
  if (!query) return true;
  const haystack = normalize(
    [
      user.name,
      user.email,
      user.phone,
      user.wilaya,
      user.commune,
      role?.name ?? "",
      role?.nameAr ?? "",
      org?.name ?? "",
      org?.code ?? "",
    ].join(" "),
  );
  return haystack.includes(query);
}

export function downloadCsv(name: string, rows: (string | number)[][]) {
  const content = rows
    .map((row) =>
      row
        .map((cell) => `"${String(cell).replace(/"/g, '""')}"`)
        .join(","),
    )
    .join("\n");
  const blob = new Blob(["\uFEFF", content], {
    type: "text/csv;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

