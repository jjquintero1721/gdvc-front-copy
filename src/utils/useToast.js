import { useToastContext } from "@/components/ui/ToastProvider"

export default function useToast() {
  const push = useToastContext()

  return {
    success: (msg) => push("success", msg),
    error: (msg) => push("error", msg),
    warning: (msg) => push("warning", msg),
    info: (msg) => push("info", msg)
  }
}
