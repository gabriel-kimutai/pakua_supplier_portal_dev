import { API_URL } from "@/utils/env";
import { useAppSession } from "@/utils/session";
import { createServerFn } from "@tanstack/react-start";
import type { Thread } from "../threads-model";

export const getThreads = createServerFn({method: "GET"})
    .handler(async (): Promise<Thread[]> => {
        const {data: {token}} = await useAppSession()
        const res = await fetch(`${API_URL}/threads`, {
            headers: {
                "Authorization": `Bearer ${token}`,
            },
        })
        if (!res.ok) {
            throw new Error(`Failed to fetch threads: ${res.statusText}`); 
        }
        return await res.json();
    })