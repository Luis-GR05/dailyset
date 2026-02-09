import { type ReactNode } from 'react';

const AppLayout = ({ children }: { children?: ReactNode }) => {
  return (
    <div className="bg-black min-h-screen w-full">
      {children}
    </div>
  );
};

export default AppLayout;
