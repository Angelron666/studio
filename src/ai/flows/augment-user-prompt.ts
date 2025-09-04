'use server';

/**
 * @fileOverview A flow to augment the user's prompt with details from their transcription history.
 *
 * - augmentUserPrompt - A function that augments the user prompt.
 * - AugmentUserPromptInput - The input type for the augmentUserPrompt function.
 * - AugmentUserPromptOutput - The return type for the augmentUserPrompt function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AugmentUserPromptInputSchema = z.object({
  transcript: z.string().describe('The user provided transcript.'),
  history: z.array(z.string()).describe('The transcription history of the user.'),
});
export type AugmentUserPromptInput = z.infer<typeof AugmentUserPromptInputSchema>;

const AugmentUserPromptOutputSchema = z.object({
  augmentedPrompt: z.string().describe('The augmented user prompt.'),
});
export type AugmentUserPromptOutput = z.infer<typeof AugmentUserPromptOutputSchema>;

export async function augmentUserPrompt(input: AugmentUserPromptInput): Promise<AugmentUserPromptOutput> {
  return augmentUserPromptFlow(input);
}

const prompt = ai.definePrompt({
  name: 'augmentUserPromptPrompt',
  input: {schema: AugmentUserPromptInputSchema},
  output: {schema: AugmentUserPromptOutputSchema},
  prompt: `You are an AI assistant designed to augment user provided transcripts with additional context from their transcription history to produce better study notes.

  Here is the user's transcript: {{{transcript}}}

  Here is the user's transcription history: {{#each history}}{{{this}}}\n{{/each}}

  Please generate an augmented prompt that includes the most relevant information from the user's history to improve the quality of the study notes.
  Focus on details that provide context and improve the overall coherence of the prompt.

  The augmented prompt should be a single paragraph.
  Augmented Prompt:`, // Ensure single paragraph output
});

const augmentUserPromptFlow = ai.defineFlow({
  name: 'augmentUserPromptFlow',
  inputSchema: AugmentUserPromptInputSchema,
  outputSchema: AugmentUserPromptOutputSchema,
}, async input => {
  const {output} = await prompt(input);
  return output!;
});
