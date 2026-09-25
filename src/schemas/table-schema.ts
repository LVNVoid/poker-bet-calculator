import { z } from "zod";

export const tableConfigSchema = z.object({
  smallBlind: z.number().int().positive({ message: "Small Blind harus bernilai positif" }),
  bigBlind: z.number().int().positive({ message: "Big Blind harus bernilai positif" }),
  ante: z.number().int().nonnegative({ message: "Ante tidak boleh negatif" }).default(0),
});

export const initialPlayerSchema = z.object({
  id: z.string().min(1),
  name: z.string().trim().min(1, { message: "Nama pemain wajib diisi" }).max(20),
  seatNumber: z.number().int().min(1).max(10),
  stack: z.number().int().nonnegative({ message: "Stack tidak boleh negatif" }),
});

export const setupTableSchema = z.object({
  config: tableConfigSchema,
  players: z.array(initialPlayerSchema).min(2, "Minimal 2 pemain").max(10, "Maksimal 10 pemain"),
});

export type TableConfigInput = z.infer<typeof tableConfigSchema>;
export type InitialPlayerInput = z.infer<typeof initialPlayerSchema>;
export type SetupTableInput = z.infer<typeof setupTableSchema>;
