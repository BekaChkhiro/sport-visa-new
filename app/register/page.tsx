import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { homePathForRole } from "@/lib/session";
import { RegisterScreen } from "./RegisterScreen";

export default async function RegisterPage() {
  const session = await getSession();
  if (session) redirect(homePathForRole(session.role));
  return <RegisterScreen />;
}
