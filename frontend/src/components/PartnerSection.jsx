import { useState } from "react";
import api from "../services/api";
import { useTranslation } from "react-i18next";

export default function PartnerSection({ categories }) {
  const { t } = useTranslation();

  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    nom: "",
    prenom: "",
    email: "",
    telephone: "",
    specialite: "",
    piece_identite: null,
    diplome: null,
    photo_profil: null
  });

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (files) {
      setForm(prev => ({ ...prev, [name]: files[0] }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (v) fd.append(k, v);
      });

      await api.post("/techniciens/demande", fd, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      setShow(false);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="mb-12 text-center">
      <button
        onClick={() => setShow(!show)}
        className="px-6 py-3 bg-blue-600 text-white rounded"
      >
        {show ? t("home.cta_close") : t("home.cta_button")}
      </button>

      {show && (
        <form onSubmit={submit} className="mt-6 max-w-xl mx-auto flex flex-col gap-3">

          <input name="nom" placeholder="Nom" onChange={handleChange} />
          <input name="prenom" placeholder="Prénom" onChange={handleChange} />
          <input name="email" placeholder="Email" onChange={handleChange} />
          <input name="telephone" placeholder="Téléphone" onChange={handleChange} />

          <select name="specialite" onChange={handleChange}>
            <option value="">Spécialité</option>
            {categories.map(c => (
              <option key={c.id} value={c.nom}>{c.nom}</option>
            ))}
          </select>

          <button disabled={loading} className="bg-green-600 text-white py-2">
            {loading ? "Envoi..." : "Envoyer"}
          </button>
        </form>
      )}
    </section>
  );
}