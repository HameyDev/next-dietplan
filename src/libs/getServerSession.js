import { getServerSession } from "next-auth/next";
import { authOptions } from "./authOptions";

export async function getAdminSession(req, res) {
  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return null;
  }
  return session;
}
