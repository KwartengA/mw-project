import { z } from "zod";
import { VehicleStatus, VehicleType } from "../generated/prisma/enums";

export const RegisterVehicleSchema = z.object({
	callSign: z.string().trim().min(1),
	type: z.enum(VehicleType),
	stationId: z.number().int().positive(),
	status: z.enum(VehicleStatus).default(VehicleStatus.available),
});

export const UpdateVehicleLocationSchema = z.object({
	lat: z.number().min(-90).max(90),
	lng: z.number().min(-180).max(180),
	speed: z.number().min(0).nullable().optional(),
	heading: z.number().min(0).max(360).nullable().optional(),
	recordedAt: z.iso.datetime().optional(),
});

export const RegisterDriverSchema = z.object({
	name: z.string().trim().min(1),
	phone: z.string().trim().min(1).optional(),
	vehicleId: z.number().int().positive(),
});

export const UpdateDriverLocationSchema = z.object({
	lat: z.number().min(-90).max(90),
	lng: z.number().min(-180).max(180),
	recordedAt: z.iso.datetime().optional(),
});

export const UpdateCapacitySchema = z.object({
	availableBeds: z.number().int().min(0).optional(),
	totalBeds: z.number().int().min(0).optional(),
	availableAmbulances: z.number().int().min(0).optional(),
	totalAmbulances: z.number().int().min(0).optional(),
});

export type RegisterVehiclePayload = z.infer<typeof RegisterVehicleSchema>;
export type UpdateVehicleLocationPayload = z.infer<
	typeof UpdateVehicleLocationSchema
>;
export type RegisterDriverPayload = z.infer<typeof RegisterDriverSchema>;
export type UpdateDriverLocationPayload = z.infer<
	typeof UpdateDriverLocationSchema
>;
