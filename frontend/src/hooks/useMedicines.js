import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../services/api.js";

export function useMedicines() {
  return useQuery({
    queryKey: ["medicines"],
    queryFn: async () => {
      const { data } = await api.get("/medicines");
      return data;
    },
  });
}

export function useCreateMedicine() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (medicineData) => {
      const { data } = await api.post("/medicines", medicineData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["medicines"] });
    },
  });
}

export function useUpdateMedicineStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }) => {
      const { data } = await api.put(`/medicines/status/${id}`, { status });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["medicines"] });
    },
  });
}
