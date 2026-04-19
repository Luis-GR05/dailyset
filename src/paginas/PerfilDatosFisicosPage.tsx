import { useEffect, useState } from "react";
import { AppLayout, TituloPagina } from "../componentes";
import { useI18n } from "../context/I18nContext";
import { useAuth } from "../context/AuthContext";

export default function PerfilDatosFisicosPage() {
  const { t, locale } = useI18n();
  const { user, updateUser } = useAuth();

  const [pesoKg, setPesoKg] = useState(user?.pesoKg?.toString() ?? "");
  const [alturaCm, setAlturaCm] = useState(user?.alturaCm?.toString() ?? "");
  const [edad, setEdad] = useState(user?.edad?.toString() ?? "");
  const [genero, setGenero] = useState(user?.genero ?? "");
  const [objetivoPesoKg, setObjetivoPesoKg] = useState(user?.objetivoPesoKg?.toString() ?? "");

  const [savingPhysicalData, setSavingPhysicalData] = useState(false);
  const [errorPhysicalData, setErrorPhysicalData] = useState("");
  const [successPhysicalData, setSuccessPhysicalData] = useState(false);

  useEffect(() => {
    if (!user) return;
    setPesoKg(user.pesoKg?.toString() ?? "");
    setAlturaCm(user.alturaCm?.toString() ?? "");
    setEdad(user.edad?.toString() ?? "");
    setGenero(user.genero ?? "");
    setObjetivoPesoKg(user.objetivoPesoKg?.toString() ?? "");
  }, [user]);

  const parseOptionalNumber = (value: string): number | undefined => {
    if (!value.trim()) return undefined;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  };

  const handleGuardarDatosFisicos = async () => {
    const hasInvalidNumericValue = [pesoKg, alturaCm, edad, objetivoPesoKg].some(
      (value) => value.trim() !== "" && !Number.isFinite(Number(value)),
    );
    const parsedPeso = parseOptionalNumber(pesoKg);
    const parsedAltura = parseOptionalNumber(alturaCm);
    const parsedEdad = parseOptionalNumber(edad);
    const parsedObjetivoPeso = parseOptionalNumber(objetivoPesoKg);

    if (hasInvalidNumericValue) {
      setErrorPhysicalData(locale === "es" ? "Revisa los valores numéricos" : "Please review numeric values");
      return;
    }

    if (
      (parsedPeso !== undefined && (parsedPeso < 30 || parsedPeso > 350)) ||
      (parsedAltura !== undefined && (parsedAltura < 100 || parsedAltura > 250)) ||
      (parsedEdad !== undefined && (parsedEdad < 12 || parsedEdad > 100)) ||
      (parsedObjetivoPeso !== undefined && (parsedObjetivoPeso < 30 || parsedObjetivoPeso > 350))
    ) {
      setErrorPhysicalData(locale === "es" ? "Algún valor está fuera de rango" : "Some values are out of range");
      return;
    }

    setSavingPhysicalData(true);
    setErrorPhysicalData("");
    setSuccessPhysicalData(false);

    try {
      await updateUser({
        pesoKg: parsedPeso,
        alturaCm: parsedAltura,
        edad: parsedEdad,
        genero,
        objetivoPesoKg: parsedObjetivoPeso,
      });
      setSuccessPhysicalData(true);
      setTimeout(() => setSuccessPhysicalData(false), 2000);
    } catch {
      setErrorPhysicalData(t.profile.saveError);
    } finally {
      setSavingPhysicalData(false);
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6 pb-10 max-w-4xl mx-auto">
        <TituloPagina titulo={t.profile.physicalData} />

        <div className="space-y-3">
          <h3 className="text-neutral-500 text-[10px] font-black uppercase tracking-[0.4em] ml-2 italic">
            {t.profile.physicalData}
          </h3>
          <div className="bg-neutral-900/40 border border-white/5 rounded-2xl p-5 backdrop-blur-xl">
            <p className="text-neutral-500 text-[10px] mb-4 uppercase tracking-[0.16em] font-bold">
              {t.profile.completePhysicalData}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input
                type="number"
                min={30}
                max={350}
                step="0.1"
                value={pesoKg}
                onChange={(e) => setPesoKg(e.target.value)}
                placeholder={t.profile.weight}
                className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-white/20"
              />
              <input
                type="number"
                min={100}
                max={250}
                value={alturaCm}
                onChange={(e) => setAlturaCm(e.target.value)}
                placeholder={t.profile.height}
                className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-white/20"
              />
              <input
                type="number"
                min={12}
                max={100}
                value={edad}
                onChange={(e) => setEdad(e.target.value)}
                placeholder={t.profile.age}
                className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-white/20"
              />
              <select
                value={genero}
                onChange={(e) => setGenero(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-white/20"
              >
                <option value="" className="bg-neutral-900">
                  {t.profile.gender}
                </option>
                <option value="female" className="bg-neutral-900">
                  {t.profile.genderFemale}
                </option>
                <option value="male" className="bg-neutral-900">
                  {t.profile.genderMale}
                </option>
                <option value="non_binary" className="bg-neutral-900">
                  {t.profile.genderNonBinary}
                </option>
                <option value="other" className="bg-neutral-900">
                  {t.profile.genderOther}
                </option>
                <option value="prefer_not_say" className="bg-neutral-900">
                  {t.profile.genderPreferNotSay}
                </option>
              </select>
              <input
                type="number"
                min={30}
                max={350}
                step="0.1"
                value={objetivoPesoKg}
                onChange={(e) => setObjetivoPesoKg(e.target.value)}
                placeholder={t.profile.targetWeight}
                className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-white/20 md:col-span-2"
              />
            </div>

            {errorPhysicalData && <p className="text-red-400 text-[11px] mt-3 font-bold">{errorPhysicalData}</p>}
            {successPhysicalData && (
              <p className="text-green-400 text-[11px] mt-3 font-bold">{t.profile.physicalDataSaved}</p>
            )}

            <button
              onClick={handleGuardarDatosFisicos}
              disabled={savingPhysicalData}
              className="mt-4 w-full bg-white/5 border border-white/10 text-white py-3 rounded-xl font-black italic uppercase text-[10px] tracking-[0.2em] hover:bg-white/10 transition-all active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {savingPhysicalData ? (locale === "es" ? "Guardando..." : "Saving...") : t.profile.save}
            </button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
