import type { User } from "@/lib/user-model";
import { useSession } from "@tanstack/react-start/server";

export type SessionUser = {
  token?: string;
  user?: User;
};

export function useAppSession() {
  const session = useSession<SessionUser>({
    password: "aj32Ndnqw1dk2Jf91k39sdLxQowpXbl4"
  });
  return session
}
