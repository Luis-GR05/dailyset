import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '../';
import { supabase } from '../../lib/supabaseClient';

interface FormErrors {
    nombre_usuario?: string;
    nombre_completo?: string;
    email?: string;
    password?: string;
    confirmar?: string;
}

// Validaciones individuales por campo
function validarCampo(campo: string, valor: string, password?: string): string {
    switch (campo) {
        case 'nombre_usuario':
            if (!valor.trim()) return 'El nombre de usuario es obligatorio';
            if (valor.length < 3) return 'Mínimo 3 caracteres';
            if (valor.length > 20) return 'Máximo 20 caracteres';
            if (!/^[a-zA-Z0-9_]+$/.test(valor)) return 'Solo letras, números y guión bajo';
            return '';
        case 'nombre_completo':
            if (valor.trim() && valor.trim().length < 2) return 'Mínimo 2 caracteres';
            return '';
        case 'email':
            if (!valor.trim()) return 'El email es obligatorio';
            if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(valor)) return 'Email no válido';
            return '';
        case 'password':
            if (!valor) return 'La contraseña es obligatoria';
            if (valor.length < 6) return 'Mínimo 6 caracteres';
            if (!/\d/.test(valor)) return 'Debe contener al menos un número';
            return '';
        case 'confirmar':
            if (!valor) return 'Confirma tu contraseña';
            if (valor !== password) return 'Las contraseñas no coinciden';
            return '';
        default:
            return '';
    }
}

export default function FormularioRegistro() {
    const navigate = useNavigate();

    const [form, setForm] = useState({
        nombre_usuario: '',
        nombre_completo: '',
        email: '',
        password: '',
        confirmar: '',
    });
    const [errors, setErrors] = useState<FormErrors>({});
    const [serverError, setServerError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (campo: string, valor: string) => {
        setForm(prev => ({ ...prev, [campo]: valor }));
        if (errors[campo as keyof FormErrors]) {
            setErrors(prev => ({ ...prev, [campo]: '' }));
        }
    };

    const handleBlur = (campo: string) => {
        const error = validarCampo(campo, form[campo as keyof typeof form], form.password);
        setErrors(prev => ({ ...prev, [campo]: error }));
    };

    const validarTodo = (): boolean => {
        const nuevosErrores: FormErrors = {
            nombre_usuario: validarCampo('nombre_usuario', form.nombre_usuario),
            nombre_completo: validarCampo('nombre_completo', form.nombre_completo),
            email: validarCampo('email', form.email),
            password: validarCampo('password', form.password),
            confirmar: validarCampo('confirmar', form.confirmar, form.password),
        };
        setErrors(nuevosErrores);
        return !Object.values(nuevosErrores).some(e => e !== '');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setServerError('');

        if (!validarTodo()) return;

        setLoading(true);
        try {
            const { error } = await supabase.auth.signUp({
                email: form.email,
                password: form.password,
                options: {
                    data: {
                        nombre_usuario: form.nombre_usuario,
                        nombre_completo: form.nombre_completo.trim() || null,
                    },
                },
            });

            if (error) {
                if (error.message.includes('already registered')) {
                    setServerError('Este email ya está registrado. ¿Quieres iniciar sesión?');
                } else if (error.message.includes('Password should be')) {
                    setServerError('La contraseña es demasiado débil.');
                } else {
                    setServerError(error.message);
                }
                return;
            }

            navigate('/dashboard');
        } catch {
            setServerError('Error inesperado. Inténtalo de nuevo.');
        } finally {
            setLoading(false);
        }
    };

    const inputBase = 'bg-white/5 border-white/10 rounded-2xl py-5 text-white w-full transition-all';
    const inputError = 'border-red-500/60 bg-red-500/5';

    return (
        <form className="space-y-4 w-full" onSubmit={handleSubmit} noValidate>

            {/* Nombre de usuario */}
            <div className="space-y-1">
                <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest ml-4">
                    Nombre de usuario <span className="text-red-400">*</span>
                </span>
                <Input
                    type="text"
                    placeholder="tu_usuario"
                    value={form.nombre_usuario}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('nombre_usuario', e.target.value)}
                    onBlur={() => handleBlur('nombre_usuario')}
                    className={`${inputBase} ${errors.nombre_usuario ? inputError : ''}`}
                />
                {errors.nombre_usuario && (
                    <p className="text-red-400 text-xs ml-4 mt-1">{errors.nombre_usuario}</p>
                )}
            </div>

            {/* Nombre completo */}
            <div className="space-y-1">
                <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest ml-4">
                    Nombre completo <span className="text-neutral-600">(opcional)</span>
                </span>
                <Input
                    type="text"
                    placeholder="Tu nombre y apellidos"
                    value={form.nombre_completo}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('nombre_completo', e.target.value)}
                    onBlur={() => handleBlur('nombre_completo')}
                    className={`${inputBase} ${errors.nombre_completo ? inputError : ''}`}
                />
                {errors.nombre_completo && (
                    <p className="text-red-400 text-xs ml-4 mt-1">{errors.nombre_completo}</p>
                )}
            </div>

            {/* Email */}
            <div className="space-y-1">
                <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest ml-4">
                    Email <span className="text-red-400">*</span>
                </span>
                <Input
                    type="email"
                    placeholder="atleta@dailyset.com"
                    value={form.email}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('email', e.target.value)}
                    onBlur={() => handleBlur('email')}
                    className={`${inputBase} ${errors.email ? inputError : ''}`}
                />
                {errors.email && (
                    <p className="text-red-400 text-xs ml-4 mt-1">{errors.email}</p>
                )}
            </div>

            {/* Contraseña */}
            <div className="space-y-1">
                <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest ml-4">
                    Contraseña <span className="text-red-400">*</span>
                </span>
                <Input
                    type="password"
                    placeholder="Mín. 6 caracteres y un número"
                    value={form.password}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('password', e.target.value)}
                    onBlur={() => handleBlur('password')}
                    className={`${inputBase} ${errors.password ? inputError : ''}`}
                />
                {errors.password && (
                    <p className="text-red-400 text-xs ml-4 mt-1">{errors.password}</p>
                )}
            </div>

            {/* Confirmar contraseña */}
            <div className="space-y-1 pb-2">
                <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest ml-4">
                    Confirmar contraseña <span className="text-red-400">*</span>
                </span>
                <Input
                    type="password"
                    placeholder="Repite la contraseña"
                    value={form.confirmar}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('confirmar', e.target.value)}
                    onBlur={() => handleBlur('confirmar')}
                    className={`${inputBase} ${errors.confirmar ? inputError : ''}`}
                />
                {errors.confirmar && (
                    <p className="text-red-400 text-xs ml-4 mt-1">{errors.confirmar}</p>
                )}
            </div>

            {/* Error del servidor */}
            {serverError && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3">
                    <p className="text-red-400 text-sm text-center">{serverError}</p>
                </div>
            )}

            {/* Botón submit */}
            <button
                type="submit"
                disabled={loading}
                className="w-full text-black font-black py-4 rounded-full transition-all active:scale-95 uppercase text-sm tracking-widest italic disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                    backgroundColor: 'var(--color-primary)',
                    boxShadow: loading ? 'none' : '0 15px 30px var(--color-primary-glow)',
                }}
                onMouseEnter={(e) => {
                    if (!loading) (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--color-primary-hover)';
                }}
                onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--color-primary)';
                }}
            >
                {loading ? 'Registrando...' : 'Registrarse Ahora'}
            </button>
        </form>
    );
}