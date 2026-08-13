import { DmSidebar } from "@/components/dm/dm-sidebar";

const MeLayout = async ({ children }: { children: React.ReactNode }) => {
  return (
    // Matches the server layout: offset past the 72px nav rail, with the width
    // and main's padding sharing one expression so they stay in lockstep.
    <div className="h-full">
      <div className="fixed inset-y-0 z-20 hidden h-full w-[max(240px,calc(25vw-72px))] flex-col md:left-[72px] md:flex">
        <DmSidebar />
      </div>
      <main className="h-full md:pl-[max(240px,calc(25vw-72px))]">
        {children}
      </main>
    </div>
  );
};

export default MeLayout;
