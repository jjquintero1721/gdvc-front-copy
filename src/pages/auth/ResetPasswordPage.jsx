import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import authService from "@/services/authService";

// UI Components
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

// Icons
import AtSignIcon from "@/assets/icons/AtSignIcon";
import LockIcon from "@/assets/icons/LockIcon";

// Toast
import { useToastContext } from "@/components/ui/ToastProvider";

import "./ResetPasswordPage.css";

function ResetPasswordPage() {
  const navigate = useNavigate();
  const toast = useToastContext();

  const [step, setStep] = useState(1); // 1 = correo, 2 = nueva contraseña
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    correo: "",
    nueva: "",
    confirmar: ""
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleEmailSubmit = (e) => {
    e.preventDefault();

    if (!form.correo.trim()) {
      toast("error", "El correo es obligatorio");
      return;
    }

    toast("info", "Correo verificado. Continúa.");
    setStep(2);
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    if (!form.nueva || !form.confirmar) {
      toast("error", "Todos los campos son obligatorios");
      return;
    }

    if (form.nueva.length < 8) {
      toast("error", "La contraseña debe tener mínimo 8 caracteres");
      return;
    }

    if (form.nueva !== form.confirmar) {
      toast("error", "Las contraseñas no coinciden");
      return;
    }

    setLoading(true);

    try {
      await authService.resetPassword(form.correo, form.nueva, form.confirmar);

      toast("success", "Contraseña actualizada correctamente");

      setTimeout(() => {
        navigate("/login", {
          state: {
            message: "Tu contraseña fue restablecida. Inicia sesión."
          }
        });
      }, 1500);
    } catch (err) {
      toast("error", err.message || "Error al restablecer contraseña");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="reset-password-page">
      <div className="reset-card-modern">

        <h1 className="reset-title">Restablecer Contraseña</h1>
        <p className="reset-subtitle">Cambia tu contraseña en dos pasos</p>

        {step === 1 && (
          <form className="reset-form" onSubmit={handleEmailSubmit}>
            <Input
              label="Correo asociado"
              placeholder="usuario@correo.com"
              type="email"
              name="correo"
              value={form.correo}
              onChange={handleChange}
              icon={<AtSignIcon />}
            />

            <Button fullWidth type="submit">
              Continuar
            </Button>

            <div className="reset-back">
              <Link to="/login">← Volver al inicio de sesión</Link>
            </div>
          </form>
        )}

        {step === 2 && (
          <form className="reset-form" onSubmit={handlePasswordSubmit}>
            <Input
              label="Nueva contraseña"
              type="password"
              name="nueva"
              placeholder="••••••••"
              value={form.nueva}
              onChange={handleChange}
              icon={<LockIcon />}
            />

            <Input
              label="Confirmar contraseña"
              type="password"
              name="confirmar"
              placeholder="••••••••"
              value={form.confirmar}
              onChange={handleChange}
              icon={<LockIcon />}
            />

            <Button fullWidth loading={loading} type="submit">
              Guardar nueva contraseña
            </Button>

            <div className="reset-back">
              <button type="button" onClick={() => setStep(1)}>← Cambiar correo</button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
}

export default ResetPasswordPage;
