export type FacultyApiResponse<T = unknown> = {
  success?: boolean;
  error?: string;
  message?: string;
  [key: string]: unknown;
} & T;

async function facultyFetch<T>(
  endpoint: string,
  options?: RequestInit,
): Promise<T> {
  const response = await fetch(endpoint, {
    ...options,
    credentials: "include",
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers ?? {}),
    },
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      data?.error || `Faculty API request failed (${response.status})`,
    );
  }

  return data as T;
}

export const facultyApi = {
  profile: () =>
    facultyFetch("/api/faculty/profile"),

  academic: () =>
    facultyFetch("/api/faculty/academic"),

  subjects: () =>
    facultyFetch("/api/faculty/subjects"),

  students: () =>
    facultyFetch("/api/faculty/students"),

  notes: () =>
    facultyFetch("/api/faculty/notes"),

  updateProfile: (payload: { name: string }) =>
    facultyFetch("/api/faculty/profile", {
      method: "PUT",
      body: JSON.stringify(payload),
    }),

  createNote: (payload: Record<string, unknown>) =>
    facultyFetch("/api/faculty/notes", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  updateNote: (
    id: string,
    payload: Record<string, unknown>,
  ) =>
    facultyFetch("/api/faculty/notes", {
      method: "PUT",
      body: JSON.stringify({
        id,
        ...payload,
      }),
    }),

  deleteNote: (id: string) =>
    facultyFetch("/api/faculty/notes", {
      method: "DELETE",
      body: JSON.stringify({ id }),
    }),
};