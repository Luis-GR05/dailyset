
export const FormularioRegistro = () => {
    return (
        <>
            <h1>Formulario de Registro</h1>
            <form>
                <div>
                    <label htmlFor="email">Email:</label>
                    <input type="email" id="email" name="email" required />
                </div>
                <div>
                    <label htmlFor="contraseña">Contraseña:</label>
                    <input type="contraseña" id="contraseña" name="contraseña" required />
                </div>
            </form>
        </>
    )
}
