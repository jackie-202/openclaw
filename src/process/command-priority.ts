export const COMMAND_PRIORITY_VALUES = ["interactive", "background"] as const;

export type CommandPriority = (typeof COMMAND_PRIORITY_VALUES)[number];
