import { z } from "zod";

export const overviewSchema = z.object({
  projectName: z.string().default(""),
  background: z.string().default(""),
  businessGoals: z.array(z.string()).default([]),
  targetUsers: z.string().default(""),
  techStack: z.string().optional().default(""),
});

export type OverviewSchemaType = z.infer<typeof overviewSchema>;
