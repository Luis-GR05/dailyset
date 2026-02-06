import { FormularioRegistro } from "../componentes/FormularioRegistro";
import { BotonRegistro } from "../componentes/BotonRegistro";

export const Login = () => {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4">
            <div className="w-full max-w-sm">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-[#2F31F5]">DAILYSET</h1>
                    <p className="text-gray-600 mt-2">Tu gimnasio digital</p>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-xl font-semibold text-gray-800 mb-6 text-center">
                        Crear cuenta
                    </h2>

                    <FormularioRegistro />
                    <BotonRegistro />

                    <div className="mt-6 text-center">
                        <p className="text-sm text-gray-600">
                            ¿Ya tienes cuenta?{" "}
                            <a href="#" className="text-[#2F31F5] font-medium hover:text-[#2F31F5]/80">
                                Inicia sesión
                            </a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
