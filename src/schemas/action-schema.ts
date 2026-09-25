import { z } from "zod";

export const playerBetActionSchema = z.object({
  playerId: z.string().min(1),
  action: z.enum(["fold", "check", "call", "bet", "raise", "allin"]),
  amount: z.number().int().nonnegative().default(0),
});

export const payoutWinnerSchema = z.object({
  potId: z.string().min(1),
  winnerIds: z.array(z.string().min(1)).min(1, "Minimal 1 pemenang untuk setiap pot"),
});

export const showdownPayoutSchema = z.object({
  allocations: z.array(payoutWinnerSchema).min(1, "Alokasi pot tidak boleh kosong"),
});

export type PlayerBetActionInput = z.infer<typeof playerBetActionSchema>;
export type PayoutWinnerInput = z.infer<typeof payoutWinnerSchema>;
export type ShowdownPayoutInput = z.infer<typeof showdownPayoutSchema>;
