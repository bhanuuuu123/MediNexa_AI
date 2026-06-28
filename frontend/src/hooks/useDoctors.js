import { useQuery } from "@tanstack/react-query";
import api from "../services/api.js";

export function useDoctors(page = 1, specialty = "") {
  return useQuery({
    queryKey: ["doctors", page, specialty],
    queryFn: async () => {
      const params = { page, limit: 12 };
      if (specialty) params.specialty = specialty;
      
      const { data } = await api.get("/doctors", { params });
      return data;
    },
  });
}
