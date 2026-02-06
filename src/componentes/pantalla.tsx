import { type ReactNode } from 'react';

const Pantalla = ({ children }: { children?: ReactNode }) => {
  return (
    <div className="bg-black min-h-screen w-full">
      {children}
    </div>
  );
};

export default Pantalla;
