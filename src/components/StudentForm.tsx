import { useEffect, useState } from "react";
import axios from "axios";

import {
  Alert,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  InputAdornment,
  TextField,
} from "@mui/material";

import SearchIcon from "@mui/icons-material/Search";

import { api } from "../services/api";

import type {
  Address,
  Student,
  StudentFormData,
} from "../types/student";

interface StudentFormProps {
  open: boolean;
  student: Student | null;
  onClose: () => void;
  onSaved: () => void;
}

interface FormErrors {
  name: string;
  email: string;
  phone: string;
  zip_code: string;
}

const EMPTY_ERRORS: FormErrors = {
  name: "",
  email: "",
  phone: "",
  zip_code: "",
};

const CEP_CACHE_PREFIX = "viacep_";

export function StudentForm({
  open,
  student,
  onClose,
  onSaved,
}: StudentFormProps) {
  const [formData, setFormData] = useState<StudentFormData>(() => ({
    name: student?.name ?? "",
    email: student?.email ?? "",
    phone: student?.phone ?? "",
    zip_code: student?.zip_code ?? "",
  }));

  const [address, setAddress] = useState<Address | null>(null);

  const [loadingCep, setLoadingCep] = useState(false);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] =
    useState<FormErrors>(EMPTY_ERRORS);

  const isEditing = student !== null;

  /*
   * Quando o formulário é aberto para edição,
   * tenta carregar automaticamente o endereço
   * através do CEP já cadastrado.
   */
  useEffect(() => {
    if (!open || !student?.zip_code) {
      return;
    }

    searchCep(student.zip_code);
  }, [open, student]);

  /*
   * Formata o CEP para exibição:
   *
   * 89069040
   * ↓
   * 89069-040
   */
  function formatCep(value: string) {
    const numbers = value.replace(/\D/g, "").slice(0, 8);

    if (numbers.length <= 5) {
      return numbers;
    }

    return `${numbers.slice(0, 5)}-${numbers.slice(5)}`;
  }

  /*
   * Recupera o endereço armazenado no localStorage.
   */
  function getCachedAddress(cep: string): Address | null {
    const cacheKey = `${CEP_CACHE_PREFIX}${cep}`;

    const cachedAddress = localStorage.getItem(cacheKey);

    if (!cachedAddress) {
      return null;
    }

    try {
      return JSON.parse(cachedAddress) as Address;
    } catch {
      localStorage.removeItem(cacheKey);
      return null;
    }
  }

  /*
   * Salva o endereço consultado no localStorage.
   */
  function cacheAddress(addressData: Address) {
    const cep = addressData.cep.replace(/\D/g, "");

    const cacheKey = `${CEP_CACHE_PREFIX}${cep}`;

    localStorage.setItem(
      cacheKey,
      JSON.stringify(addressData),
    );
  }

  /*
   * Consulta o CEP.
   *
   * Primeiro verifica o localStorage.
   * Se não encontrar, consulta o ViaCEP.
   */
  async function searchCep(
    cepValue: string = formData.zip_code,
  ) {
    const cep = cepValue.replace(/\D/g, "");

    if (cep.length !== 8) {
      setFieldErrors((previous) => ({
        ...previous,
        zip_code: "CEP deve conter 8 dígitos.",
      }));

      setAddress(null);

      return;
    }

    try {
      setLoadingCep(true);
      setError("");

      setFieldErrors((previous) => ({
        ...previous,
        zip_code: "",
      }));

      /*
       * 1. Primeiro tenta encontrar no cache.
       */
      const cachedAddress = getCachedAddress(cep);

      if (cachedAddress) {
        setAddress(cachedAddress);
        return;
      }

      /*
       * 2. Se não encontrou no cache,
       * consulta o ViaCEP.
       */
      const response = await axios.get<Address>(
        `https://viacep.com.br/ws/${cep}/json/`,
      );

      /*
       * ViaCEP retorna { erro: true } quando
       * o CEP não existe.
       */
      if (
        "erro" in response.data &&
        response.data.erro
      ) {
        setAddress(null);

        setFieldErrors((previous) => ({
          ...previous,
          zip_code: "CEP não encontrado.",
        }));

        return;
      }

      /*
       * 3. Salva o resultado no localStorage.
       */
      cacheAddress(response.data);

      /*
       * 4. Atualiza a tela.
       */
      setAddress(response.data);
    } catch (error: unknown) {
      setAddress(null);

      if (axios.isAxiosError(error)) {
        setError(
          error.response?.data?.message ||
          "Não foi possível consultar o CEP.",
        );
      } else {
        setError(
          "Não foi possível consultar o CEP.",
        );
      }
    } finally {
      setLoadingCep(false);
    }
  }

  function formatPhone(value: string): string { 
      const numbers = value.replace(/\D/g, "").slice(0, 11); 
      
      if (numbers.length === 0) { return ""; } 
      if (numbers.length <= 2) { return `(${numbers}`; } 
      if (numbers.length <= 6) { return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`; } 
      if (numbers.length <= 10) { return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 6,)}-${numbers.slice(6)}`; } 
      
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7,)}-${numbers.slice(7)}`; 
    }

  function handleChange(
    field: keyof StudentFormData,
    value: string,
  ) {
    let newValue = value;

    /*
    * CEP:
    * aceita somente números e no máximo 8 dígitos.
    */
    if (field === "zip_code") {
      newValue = formatCep(value);

      setAddress(null);
    }

    /*
    * Telefone:
    * aplica máscara e limita a 11 dígitos.
    */
    if (field === "phone") {
      newValue = formatPhone(value);
    }

    /*
    * Atualiza o formulário somente depois
    * de aplicar as máscaras.
    */
    setFormData((previous) => ({
      ...previous,
      [field]: newValue,
    }));

    /*
    * Remove o erro do campo enquanto o usuário
    * começa a corrigi-lo.
    */
    if (fieldErrors[field]) {
      setFieldErrors((previous) => ({
        ...previous,
        [field]: "",
      }));
    }

    if (error) {
      setError("");
    }
  }

  function validateForm(): boolean {
    const errors: FormErrors = {
      name: "",
      email: "",
      phone: "",
      zip_code: "",
    };

    const name = formData.name.trim();
    const email = formData.email.trim();
    const phone = formData.phone.trim();
    const cep = formData.zip_code.replace(/\D/g, "");

    /*
     * Nome
     */
    if (!name) {
      errors.name = "Nome é obrigatório.";
    }

    /*
     * E-mail
     */
    if (!email) {
      errors.email = "E-mail é obrigatório.";
    } else if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ) {
      errors.email = "Digite um e-mail válido.";
    }

    /*
     * Telefone
     */
    if (!phone) {
      errors.phone = "Telefone é obrigatório.";
    }

    /*
     * CEP
     */
    if (!cep) {
      errors.zip_code = "CEP é obrigatório.";
    } else if (cep.length !== 8) {
      errors.zip_code =
        "CEP deve conter 8 dígitos.";
    }

    setFieldErrors(errors);

    return !Object.values(errors).some(
      Boolean,
    );
  }

  async function handleSubmit() {
    setError("");

    if (!validateForm()) {
      return;
    }

    try {
      setSaving(true);

      /*
       * Remove a máscara do CEP antes de enviar
       * para o backend.
       */
      const dataToSend = {
        ...formData,
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        zip_code: formData.zip_code.replace(
          /\D/g,
          "",
        ),
      };

      if (isEditing) {
        await api.put(
          `/students/${student.id}`,
          dataToSend,
        );
      } else {
        await api.post(
          "/students/",
          dataToSend,
        );
      }

      onSaved();
      onClose();
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        setError(
          error.response?.data?.detail ||
          "Não foi possível salvar o aluno.",
        );
      } else {
        setError(
          "Não foi possível salvar o aluno.",
        );
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog
      open={open}
      onClose={saving ? undefined : onClose}
      fullWidth
      maxWidth="md"
    >
      <DialogTitle>
        {isEditing
          ? "Editar aluno"
          : "Novo aluno"}
      </DialogTitle>

      <DialogContent>
        <Grid
          container
          spacing={2}
          sx={{ mt: 0.5 }}
        >
          {error && (
            <Grid size={12}>
              <Alert severity="error">
                {error}
              </Alert>
            </Grid>
          )}

          {/* NOME */}
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              required
              label="Nome"
              value={formData.name}
              error={Boolean(fieldErrors.name)}
              helperText={fieldErrors.name}
              onChange={(event) =>
                handleChange(
                  "name",
                  event.target.value,
                )
              }
            />
          </Grid>

          {/* E-MAIL */}
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              required
              label="E-mail"
              type="email"
              value={formData.email}
              error={Boolean(fieldErrors.email)}
              helperText={fieldErrors.email}
              onChange={(event) =>
                handleChange(
                  "email",
                  event.target.value,
                )
              }
            />
          </Grid>

          {/* TELEFONE */}
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              required
              label="Telefone"
              value={formData.phone}
              error={Boolean(fieldErrors.phone)}
              helperText={fieldErrors.phone}
              onChange={(event) =>
                handleChange(
                  "phone",
                  event.target.value,
                )
              }
            />
          </Grid>

          {/* CEP */}
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              required
              label="CEP"
              placeholder="00000-000"
              value={formData.zip_code}
              error={Boolean(
                fieldErrors.zip_code,
              )}
              helperText={
                fieldErrors.zip_code ||
                "Digite o CEP e consulte o endereço"
              }
              onChange={(event) =>
                handleChange(
                  "zip_code",
                  event.target.value,
                )
              }
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() =>
                          searchCep()
                        }
                        disabled={loadingCep}
                        edge="end"
                        aria-label="Consultar CEP"
                      >
                        {loadingCep ? (
                          <CircularProgress
                            size={22}
                          />
                        ) : (
                          <SearchIcon />
                        )}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
            />
          </Grid>

          {/* LOGRADOURO */}
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Logradouro"
              value={
                address?.logradouro ?? ""
              }
              disabled
            />
          </Grid>

          {/* BAIRRO */}
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Bairro"
              value={address?.bairro ?? ""}
              disabled
            />
          </Grid>

          {/* CIDADE */}
          <Grid size={{ xs: 12, md: 8 }}>
            <TextField
              fullWidth
              label="Cidade"
              value={
                address?.localidade ?? ""
              }
              disabled
            />
          </Grid>

          {/* UF */}
          <Grid size={{ xs: 12, md: 4 }}>
            <TextField
              fullWidth
              label="UF"
              value={address?.uf ?? ""}
              disabled
            />
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions>
        <Button
          onClick={onClose}
          disabled={saving}
        >
          Cancelar
        </Button>

        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={saving}
        >
          {saving
            ? "Salvando..."
            : "Salvar"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}