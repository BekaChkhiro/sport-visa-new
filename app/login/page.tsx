import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { homePathForRole } from "@/lib/session";
import { LoginScreen } from "./LoginScreen";

export default async function LoginPage() {
  const session = await getSession();
  if (session) redirect(homePathForRole(session.role));
  return <LoginScreen />;
}
