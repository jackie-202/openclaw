import { z } from "zod";

const destinationComponentSchema = z
  .string()
  .min(1)
  .max(96)
  .regex(/^[A-Za-z0-9][A-Za-z0-9._~-]{0,95}$/);

const discordDeliveryTargetSchema = z
  .object({
    provider: z.literal("discord"),
    accountId: destinationComponentSchema,
    channelId: destinationComponentSchema,
    threadId: destinationComponentSchema.optional(),
  })
  .strict();

const slackDeliveryTargetSchema = z
  .object({
    provider: z.literal("slack"),
    accountId: destinationComponentSchema,
    channelId: destinationComponentSchema,
    threadId: z
      .string()
      .min(3)
      .max(96)
      .regex(/^\d+\.\d+$/),
  })
  .strict();

export const kmDeliveryTargetSchema = z.discriminatedUnion("provider", [
  discordDeliveryTargetSchema,
  slackDeliveryTargetSchema,
]);

export type KmDeliveryTarget = z.infer<typeof kmDeliveryTargetSchema>;

export function parseKmDeliveryTarget(value: unknown, field = "deliveryTarget"): KmDeliveryTarget {
  const parsed = kmDeliveryTargetSchema.safeParse(value);
  if (!parsed.success) {
    throw new Error(`KM returned an invalid ${field}`);
  }
  return parsed.data;
}
