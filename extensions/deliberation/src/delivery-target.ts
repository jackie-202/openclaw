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
    mode: z.enum(["root", "thread", "source_anchor"]),
    threadId: destinationComponentSchema.optional(),
  })
  .strict()
  .superRefine((target, ctx) => {
    if ((target.mode === "root") === (target.threadId !== undefined)) {
      ctx.addIssue({ code: "custom", message: "target mode and threadId disagree" });
    }
  });

const slackDeliveryTargetSchema = z
  .object({
    provider: z.literal("slack"),
    accountId: destinationComponentSchema,
    channelId: destinationComponentSchema,
    mode: z.enum(["root", "thread"]),
    threadId: z
      .string()
      .min(3)
      .max(96)
      .regex(/^\d+\.\d+$/)
      .optional(),
  })
  .strict()
  .superRefine((target, ctx) => {
    if ((target.mode === "root") === (target.threadId !== undefined)) {
      ctx.addIssue({ code: "custom", message: "target mode and threadId disagree" });
    }
  });

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
