/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Alert,
  Box,
  Button,
  Container,
  InputAdornment,
  Snackbar,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";

import { api } from "../services/api";

import type { Student } from "../types/student";

import { Dashboard } from "../components/Dashboard";
import { StudentTable } from "../components/StudentTable";
import { StudentForm } from "../components/StudentForm";
import { ConfirmDialog } from "../components/ConfirmDialog";

export function Students() {
  const [students, setStudents] = useState<Student[]>(
    [],
  );

  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");

  const [formOpen, setFormOpen] = useState(false);

  const [selectedStudent, setSelectedStudent] =
    useState<Student | null>(null);

  const [studentToDelete, setStudentToDelete] =
    useState<Student | null>(null);

  const [deleting, setDeleting] = useState(false);

  const [message, setMessage] = useState("");

  async function loadStudents() {
    try {
      setLoading(true);

      const response =
        await api.get<Student[]>("/students/");

      setStudents(response.data);
    } catch (error) {
      setMessage(
        "Não foi possível carregar os alunos.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadStudents();
  }, []);

  function handleCreate() {
    setSelectedStudent(null);
    setFormOpen(true);
  }

  function handleEdit(student: Student) {
    setSelectedStudent(student);
    setFormOpen(true);
  }

  function handleCloseForm() {
    setFormOpen(false);
    setSelectedStudent(null);
  }

  function handleDeleteRequest(
    student: Student,
  ) {
    setStudentToDelete(student);
  }

  function handleCloseDelete() {
    if (!deleting) {
      setStudentToDelete(null);
    }
  }

  async function handleDelete() {
    if (!studentToDelete) {
      return;
    }

    try {
      setDeleting(true);

      await api.delete(
        `/students/${studentToDelete.id}`,
      );

      setStudentToDelete(null);

      setMessage(
        "Aluno excluído com sucesso.",
      );

      await loadStudents();
    } catch (error) {
      setMessage(
        "Não foi possível excluir o aluno.",
      );
    } finally {
      setDeleting(false);
    }
  }

  const filteredStudents = useMemo(() => {
    const searchValue =
      search.trim().toLowerCase();

    if (!searchValue) {
      return students;
    }

    return students.filter((student) => {
      return (
        student.name
          .toLowerCase()
          .includes(searchValue) ||
        student.email
          .toLowerCase()
          .includes(searchValue) ||
        student.zip_code
          .toLowerCase()
          .includes(searchValue)
      );
    });
  }, [students, search]);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#f7f8fa",
        py: 4,
      }}
    >
      <Container maxWidth="lg">
        <Stack spacing={4}>
          <Box>
            <Typography
              variant="h4"
              sx={{ fontWeight: 700 }}
            >
              Gestão de alunos
            </Typography>

            <Typography
              color="text.secondary"
              sx={{ mt: 1 }}
            >
              Gerencie os alunos cadastrados
              no sistema.
            </Typography>
          </Box>

          <Dashboard
            totalStudents={students.length}
          />

          <Stack
            direction={{
              xs: "column",
              sm: "row",
            }}
            spacing={2}
            sx={{
              justifyContent: "space-between",
            }}          
            >
            <TextField
              fullWidth
              placeholder="Buscar aluno..."
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              sx={{
                maxWidth: {
                  xs: "100%",
                  sm: 400,
                },
              }}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                },
              }}
            />

            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleCreate}
              sx={{
                minWidth: 160,
                minHeight: 48,
              }}
            >
              Novo aluno
            </Button>
          </Stack>

          {loading ? (
            <Typography color="text.secondary">
              Carregando alunos...
            </Typography>
          ) : (
            <StudentTable
              students={filteredStudents}
              onEdit={handleEdit}
              onDelete={handleDeleteRequest}
            />
          )}
        </Stack>
      </Container>

      <StudentForm
        key={selectedStudent?.id ?? "new"}
        open={formOpen}
        student={selectedStudent}
        onClose={handleCloseForm}
        onSaved={async () => {
          await loadStudents();

          setMessage(
            selectedStudent
              ? "Aluno atualizado com sucesso."
              : "Aluno cadastrado com sucesso.",
          );
        }}
      />

      <ConfirmDialog
        open={studentToDelete !== null}
        studentName={
          studentToDelete?.name ?? ""
        }
        loading={deleting}
        onClose={handleCloseDelete}
        onConfirm={handleDelete}
      />

      <Snackbar
        open={Boolean(message)}
        autoHideDuration={4000}
        onClose={() => setMessage("")}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
      >
        <Alert
          severity="success"
          onClose={() => setMessage("")}
          variant="filled"
        >
          {message}
        </Alert>
      </Snackbar>
    </Box>
  );
}