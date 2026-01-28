import Logo from "./Logo";

const BarraLateral = () => {
    return (
        <section className="bg-black-500 flex">
            <Logo />
            <a href="#" className="">Rutinas</a>
            <a href="#">Historial</a>
            <a href="#">Ejercicios</a>
            <a href="#">Estadísticas</a>
            <a href="#">Perfil</a>
        </section>
    );
};

export default BarraLateral;