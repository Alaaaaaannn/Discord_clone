import { Menubar } from "@/components/ui/menubar";

const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div>
      <Menubar/>
      {children}
    </div>
  );
};

export default AuthLayout;
