// @project
import SvgIcon from '@/components/SvgIcon';

// Brand colors from official brand guidelines
const brandColors = {
  openai: '#10A37F',      // ChatGPT teal green
  anthropic: '#da7756',   // Claude terra cotta
  aws: '#FF9900',         // AWS orange
  azure: '#008AD7',       // Azure blue
  google: '#4285F4',      // Google blue
  huggingface: '#FFD21E', // Hugging Face yellow
  meta: '#0668E1',        // Meta blue
};

export const integration = {
  headLine: 'Protects Every AI in Your Stack',
  captionLine: 'From development to production. From startups to Fortune 500. OmnisecAI secures it all.',
  primaryBtn: {
    children: 'See All Integrations',
    startIcon: <SvgIcon name="tabler-plug" color="background.default" />,
    href: '/integrations'
  },
  tagList: [
    { label: 'OpenAI & GPT Models', icon: { name: 'tabler-brand-openai', color: brandColors.openai } },
    { label: 'Anthropic Claude', icon: { name: 'tabler-message-chatbot', color: brandColors.anthropic } },
    { label: 'AWS Bedrock', icon: { name: 'tabler-brand-aws', color: brandColors.aws } },
    { label: 'Azure OpenAI', icon: { name: 'tabler-brand-azure', color: brandColors.azure } },
    { label: 'Google Vertex AI', icon: { name: 'tabler-brand-google', color: brandColors.google } },
    { label: 'Hugging Face', icon: { name: 'tabler-robot', color: brandColors.huggingface } },
    { label: 'Meta Llama', icon: { name: 'tabler-brand-meta', color: brandColors.meta } },
    { label: 'Custom LLMs', icon: { name: 'tabler-code', color: '#6366F1' } },
    { label: 'RAG Pipelines', icon: { name: 'tabler-database', color: '#8B5CF6' } },
    { label: 'AI Agents', icon: { name: 'tabler-robot-face', color: '#EC4899' } },
    { label: 'Embedding Models', icon: { name: 'tabler-vector', color: '#14B8A6' } },
    { label: 'Fine-Tuned Models', icon: { name: 'tabler-adjustments', color: '#F59E0B' } }
  ]
};
