import { currentProfile } from "@/lib/current-profile";
import { SignUp } from "@clerk/nextjs";
import { redirect } from "next/navigation";

export default async function Page() {
  const profile = await currentProfile();
  if (profile) {
    redirect("/");
  }
  return <SignUp />;
}
