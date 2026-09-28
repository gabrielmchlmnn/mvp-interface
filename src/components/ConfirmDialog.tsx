import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";

interface ConfirmDialogProps {
  open: boolean;
  studentName: string;
  loading?: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function ConfirmDialog({
  open,
  studentName,
  loading = false,
  onClose,
  onConfirm,
}: ConfirmDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onClose}
    >
      <DialogTitle>
        Excluir aluno
      </DialogTitle>

      <DialogContent>
        <DialogContentText>
          Tem certeza que deseja excluir{" "}
          <strong>{studentName}</strong>?
          <br />
          Essa ação não poderá ser desfeita.
        </DialogContentText>
      </DialogContent>

      <DialogActions>
        <Button
          onClick={onClose}
          disabled={loading}
        >
          Cancelar
        </Button>

        <Button
          color="error"
          variant="contained"
          onClick={onConfirm}
          disabled={loading}
        >
          {loading
            ? "Excluindo..."
            : "Excluir"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}