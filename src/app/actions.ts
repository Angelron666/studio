'use server';

import { augmentUserPrompt } from '@/ai/flows/augment-user-prompt';
import { summarizeTranscript } from '@/ai/flows/summarize-transcript';
import { suggestRelevantTopics } from '@/ai/flows/suggest-relevant-topics';

export async function generateSummaryAction({
  transcript,
  history,
}: {
  transcript: string;
  history: string[];
}): Promise<{ summary: string }> {
  try {
    const { augmentedPrompt } = await augmentUserPrompt({ transcript, history });
    const { summary } = await summarizeTranscript({ transcript: augmentedPrompt });
    return { summary };
  } catch (error) {
    console.error('Error generating summary:', error);
    throw new Error('Failed to generate summary.');
  }
}

export async function generateTopicsAction({
  previousTopics,
}: {
  previousTopics: string[];
}): Promise<{ suggestedTopics: string[] }> {
  try {
    const { suggestedTopics } = await suggestRelevantTopics({ previousTopics });
    return { suggestedTopics };
  } catch (error) {
    console.error('Error suggesting topics:', error);
    return { suggestedTopics: ['Introduction to AI', 'Machine Learning Basics', 'Natural Language Processing'] };
  }
}
