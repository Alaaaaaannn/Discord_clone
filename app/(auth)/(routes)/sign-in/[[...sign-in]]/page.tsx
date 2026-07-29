import { currentProfile } from "@/lib/current-profile";
import { SignIn } from "@clerk/nextjs";
import { redirect } from "next/navigation";

export default async function Page() {
  const profile = await currentProfile();
  if (profile) {
    redirect("/");
  }
  return <SignIn />;
}
