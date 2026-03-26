import { z } from "zod";

export const UpdateCapacitySchema = z.object({
	availableBeds: z.number().int().min(0).optional(),
	totalBeds: z.number().int().min(0).optional(),
	availableAmbulances: z.number().int().min(0).optional(),
	totalAmbulances: z.number().int().min(0).optional(),
});
