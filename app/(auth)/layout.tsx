import { Menubar } from "@/components/ui/menubar";
import { ThemeProvider } from "@/components/providers/theme-provider";

const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="h-full w-full flex flex-col items-center justify-center bg-gray-400">
      <body>
          {children}
      </body>
    </div>
  );
};

export default AuthLayout;
