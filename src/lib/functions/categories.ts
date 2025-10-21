import { API_URL } from "@/utils/env";
import { createServerFn } from "@tanstack/react-start";

export const getCategories = createServerFn()
  .handler(async () => {
    try {
      const res = await fetch(`${API_URL}/categories`, {
        // Optionally, you can add cache headers here if your backend supports it
        // headers: { 'Cache-Control': 'max-age=86400, stale-while-revalidate=86400' }
      });
      if (!res.ok) {
        throw new Error(await res.text());
      }
      return await res.json();
    } catch (e) {
      console.error("failed to load categories", e);
      return [];
    }
  });
