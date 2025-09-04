import { config } from 'dotenv';
config();

import '@/ai/flows/summarize-transcript.ts';
import '@/ai/flows/augment-user-prompt.ts';
import '@/ai/flows/suggest-relevant-topics.ts';