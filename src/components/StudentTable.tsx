import {
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";

import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

import type { Student } from "../types/student";

interface StudentTableProps {
  students: Student[];
  onEdit: (student: Student) => void;
  onDelete: (student: Student) => void;
}

export function StudentTable({
  students,
  onEdit,
  onDelete,
}: StudentTableProps) {
  if (students.length === 0) {
    return (
      <Paper
        sx={{
          p: 6,
          textAlign: "center",
          borderRadius: 3,
        }}
      >
        <Typography variant="h6">
          Nenhum aluno encontrado
        </Typography>

        <Typography color="text.secondary">
          Cadastre o primeiro aluno para começar.
        </Typography>
      </Paper>
    );
  }

  return (
    <TableContainer
      component={Paper}
      sx={{
        borderRadius: 3,
        boxShadow: "none",
        border: "1px solid",
        borderColor: "divider",
      }}
    >
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Nome</TableCell>
            <TableCell>E-mail</TableCell>
            <TableCell>Telefone</TableCell>
            <TableCell>CEP</TableCell>
            <TableCell align="right">
              Ações
            </TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {students.map((student) => (
            <TableRow
              key={student.id}
              hover
            >
              <TableCell>
                <Typography
                  variant="h3"
                  sx={{ fontWeight: 700 }}>
                  {student.name}
                </Typography>
              </TableCell>

              <TableCell>
                {student.email}
              </TableCell>

              <TableCell>
                {student.phone || "-"}
              </TableCell>

              <TableCell>
                {student.zip_code}
              </TableCell>

              <TableCell align="right">
                <Tooltip title="Editar">
                  <IconButton
                    color="primary"
                    onClick={() =>
                      onEdit(student)
                    }
                  >
                    <EditIcon />
                  </IconButton>
                </Tooltip>

                <Tooltip title="Excluir">
                  <IconButton
                    color="error"
                    onClick={() =>
                      onDelete(student)
                    }
                  >
                    <DeleteIcon />
                  </IconButton>
                </Tooltip>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}