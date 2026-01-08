import DefaultTemplate from './default';
import ModernV2Template from './modern-v2';
import { TemplateDefinition } from '../lib/template-system/types';

export const TEMPLATES: Record<string, TemplateDefinition> = {
  default: DefaultTemplate,
  'modern-v2': ModernV2Template,
};

export type TemplateId = keyof typeof TEMPLATES;

export const AVAILABLE_TEMPLATES = [
  { id: 'default', name: DefaultTemplate.metadata.name },
  { id: 'modern-v2', name: ModernV2Template.metadata.name },
];
