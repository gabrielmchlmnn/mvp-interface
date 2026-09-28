import {
  Card,
  CardContent,
  Stack,
  Typography,
} from "@mui/material";

interface DashboardProps {
  totalStudents: number;
}

export function Dashboard({
  totalStudents,
}: DashboardProps) {
  return (
    <Card
      elevation={0}
      sx={{
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 3,
      }}
    >
      <CardContent>
        <Stack spacing={1}>
          <Typography
            variant="body2"
            color="text.secondary"
          >
            Total de alunos
          </Typography>

          <Typography
            variant="h3"
            sx={{ fontWeight: 700 }}
          >
            {totalStudents}
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
          >
            alunos cadastrados no sistema
          </Typography>
        </Stack>
      </CardContent>
    </Card>
  );
}