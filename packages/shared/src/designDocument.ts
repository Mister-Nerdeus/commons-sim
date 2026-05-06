import { z } from "zod";

export const DesignDocumentSchema = z.object({
  designVersion: z.literal(1),
  designId: z.string().min(1),
  title: z.string().min(1),
  description: z.string(),
  layoutGraphRef: z.string().min(1).optional(),
  moduleGraphRef: z.string().min(1).optional(),
  userAnnotations: z.array(z.string()),
  tags: z.array(z.string()),
});
export type DesignDocument = z.infer<typeof DesignDocumentSchema>;
