"use server";

import { isRedirectError } from "next/dist/client/components/redirect";
import { redirect } from "next/navigation";
import hex57 from "../lib/0x57";
import { getSession } from "../lib/session";

export default async function attachHandle(formData: FormData) {
  const session = await getSession();
  const { userId } = session;

  if (userId == null) {
    redirect("/login");
  }

  try {
    const result = await hex57.registerHandle(userId, formData.get("handle"));

    return { success: true };
  } catch (err) {
    if (isRedirectError(err)) {
      throw err;
    }

    console.error(err);
    return { error: true };
  }
}
