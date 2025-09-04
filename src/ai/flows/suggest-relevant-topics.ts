'use server';

/**
 * @fileOverview A flow for suggesting relevant topics based on previous study sessions.
 *
 * - suggestRelevantTopics - A function that suggests relevant topics.
 * - SuggestRelevantTopicsInput - The input type for the suggestRelevantTopics function.
 * - SuggestRelevantTopicsOutput - The return type for the suggestRelevantTopics function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestRelevantTopicsInputSchema = z.object({
  previousTopics: z
    .array(z.string())
    .describe('List of previously studied topics.'),
});
export type SuggestRelevantTopicsInput = z.infer<
  typeof SuggestRelevantTopicsInputSchema
>;

const SuggestRelevantTopicsOutputSchema = z.object({
  suggestedTopics: z
    .array(z.string())
    .describe('List of suggested topics based on previous topics.'),
});
export type SuggestRelevantTopicsOutput = z.infer<
  typeof SuggestRelevantTopicsOutputSchema
>;

export async function suggestRelevantTopics(
  input: SuggestRelevantTopicsInput
): Promise<SuggestRelevantTopicsOutput> {
  return suggestRelevantTopicsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestRelevantTopicsPrompt',
  input: {schema: SuggestRelevantTopicsInputSchema},
  output: {schema: SuggestRelevantTopicsOutputSchema},
  prompt: `You are an AI tutor. Based on the student's previous topics,
you will suggest new topics that build upon their existing knowledge.

Previous Topics:
{{#each previousTopics}}
- {{this}}
{{/each}}

Suggest at least 3 relevant topics:
`,
});

const suggestRelevantTopicsFlow = ai.defineFlow(
  {
    name: 'suggestRelevantTopicsFlow',
    inputSchema: SuggestRelevantTopicsInputSchema,
    outputSchema: SuggestRelevantTopicsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
