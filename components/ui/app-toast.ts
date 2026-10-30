import { toast } from "@/components/ui/toast";

export const appToast = {
    success(title: string, description?: string) {
        toast.add({ title, description, type: "success" });
    },
    error(title: string, description?: string) {
        toast.add({ title, description, type: "error" });
    },
    warning(title: string, description?: string) {
        toast.add({ title, description, type: "warning" });
    },
};
