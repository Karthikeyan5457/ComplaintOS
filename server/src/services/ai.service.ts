import OpenAI from 'openai';
import { env } from '../config/env';
import { aiAnalysisResponseSchema, AIAnalysisResponse } from '../types/schemas';
import { supabase } from '../lib/supabase';

export class AIService {
  private openai: OpenAI | null = null;

  constructor() {
    if (env.OPENAI_API_KEY && env.OPENAI_API_KEY !== 'sk-your-openai-api-key') {
      this.openai = new OpenAI({
        apiKey: env.OPENAI_API_KEY,
      });
    }
  }

  async analyzeComplaint(title: string, description: string) {
    if (!env.OPENAI_API_KEY || !this.openai) {
      console.warn('OpenAI API key missing. Skipping AI analysis.');
      return null;
    }

    try {
      // Fetch valid categories and departments for the prompt
      const [{ data: categories }, { data: departments }] = await Promise.all([
        supabase.from('categories').select('name').eq('isActive', true),
        supabase.from('departments').select('name').eq('isActive', true),
      ]);

      const categoryNames = (categories || []).map(c => c.name);
      const departmentNames = (departments || []).map(d => d.name);

      const systemPrompt = `Analyze the following complaint and categorize it based on the available data:
Available Categories: ${categoryNames.join(', ')}
Available Departments: ${departmentNames.join(', ')}

You MUST respond with valid JSON matching this exact structure:
{
  "category": "<one of the available categories>",
  "subcategory": "<specific subcategory>",
  "priority": "<LOW|MEDIUM|HIGH|CRITICAL>",
  "department": "<one of the available departments>",
  "summary": "<concise 1-2 sentence summary>",
  "suggestedResolution": "<suggested next steps>",
  "sentiment": "<POSITIVE|NEUTRAL|NEGATIVE|VERY_NEGATIVE>",
  "confidence": <number between 0 and 1>
}

Rules:
- category MUST be one of the available categories
- department MUST be one of the available departments
- priority should reflect urgency: CRITICAL for safety/health risks, HIGH for significant disruption, MEDIUM for moderate issues, LOW for minor inconveniences
- confidence should reflect how certain you are about the classification
- summary should be concise and actionable
- suggestedResolution should provide practical next steps`;

      const completion = await this.openai.chat.completions.create({
        model: env.OPENAI_MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Complaint Title: ${title}\n\nComplaint Description: ${description}` },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.3,
        max_tokens: 500,
      });

      const content = completion.choices[0]?.message?.content;
      if (!content) {
        console.error('AI Service: Empty response from API');
        return null;
      }

      const parsed = JSON.parse(content);
      const validated = aiAnalysisResponseSchema.safeParse(parsed);

      if (!validated.success) {
        console.error('AI Service: Invalid response format:', validated.error);
        return null;
      }

      // Validate that category and department exist in our database
      const result = validated.data;

      if (!categoryNames.includes(result.category)) {
        // Try to find a close match or use "Other"
        result.category = 'Other';
      }
      if (!departmentNames.includes(result.department)) {
        result.department = departmentNames[0] || 'General';
      }

      return result;
    } catch (error: any) {
      console.log('\n❌ [AI SERVICE ERROR] Analysis failed:');
      console.log('  Message:', error?.message || error);
      console.log('  Status:', error?.status || 'N/A');
      if (error?.error) console.log('  Details:', JSON.stringify(error.error));
      return null;
    }
  }

  async detectDuplicates(title: string, description: string): Promise<Array<{ id: string; trackingId: string; title: string; similarity: number }>> {
    if (!this.openai) return [];

    try {
      // Simple approach: get recent complaints and ask AI to compare
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const { data: recentComplaints } = await supabase
        .from('complaints')
        .select('id, trackingId, title, description')
        .gte('createdAt', thirtyDaysAgo.toISOString())
        .neq('status', 'CLOSED')
        .order('createdAt', { ascending: false })
        .limit(50);

      if (!recentComplaints || recentComplaints.length === 0) return [];

      const complaintList = recentComplaints
        .map((c, i) => `[${i}] "${c.title}" - ${c.description.substring(0, 100)}`)
        .join('\n');

      const completion = await this.openai.chat.completions.create({
        model: env.OPENAI_MODEL,
        messages: [
          {
            role: 'system',
            content: `You identify duplicate or very similar complaints. Given a new complaint and a list of existing complaints, return a JSON array of potential duplicates with similarity scores. Only include complaints with similarity >= 0.7.

Respond with JSON: { "duplicates": [{ "index": <number>, "similarity": <0-1> }] }

If no duplicates found, respond with: { "duplicates": [] }`,
          },
          {
            role: 'user',
            content: `New complaint:\nTitle: ${title}\nDescription: ${description}\n\nExisting complaints:\n${complaintList}`,
          },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.1,
        max_tokens: 300,
      });

      const content = completion.choices[0]?.message?.content;
      if (!content) return [];

      const parsed = JSON.parse(content);
      if (!parsed.duplicates || !Array.isArray(parsed.duplicates)) return [];

      return parsed.duplicates
        .filter((d: any) => d.index >= 0 && d.index < recentComplaints.length && d.similarity >= 0.7)
        .map((d: any) => ({
          id: recentComplaints[d.index].id,
          trackingId: recentComplaints[d.index].trackingId,
          title: recentComplaints[d.index].title,
          similarity: Math.round(d.similarity * 100) / 100,
        }));
    } catch (error) {
      console.error('AI Service: Duplicate detection failed:', error);
      return [];
    }
  }
}

export const aiService = new AIService();
