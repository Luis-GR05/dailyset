export const FormularioRegistro = () => {
    return (
        <>
            <div className="flex justify-center items-center min-h-screen">
                <h1 className="text-blue-500 font-bold text-2xl">Formulario de Registro</h1>
                <form className="space-y-4">
                    <div>
                        <label htmlFor="email" className="block text-blue-500 font-medium">Email:</label>
                        <input type="email" id="email" name="email" required className="border border-blue-500 rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-yellow-400" />
                    </div>
                    <div>
                        <label htmlFor="contraseña">Contraseña:</label>
                        <input type="password" id="contraseña" name="contraseña" required className="border border-blue-500 rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-yellow-400" />
                    </div>
                </form>
            </div>
        </>
    )
}
