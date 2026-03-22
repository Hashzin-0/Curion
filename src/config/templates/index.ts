export { freelancerTemplate } from './freelancer';
export { devTemplate } from './dev';
export { designerTemplate } from './designer';
export { writerTemplate } from './writer';
export { artistTemplate } from './artist';

import type { SiteTemplate, TemplateKey } from '@/types/site';
import { freelancerTemplate } from './freelancer';
import { devTemplate } from './dev';
import { designerTemplate } from './designer';
import { writerTemplate } from './writer';
import { artistTemplate } from './artist';

export const templates: Record<TemplateKey, SiteTemplate> = {
  freelancer: freelancerTemplate,
  dev: devTemplate,
  designer: designerTemplate,
  writer: writerTemplate,
  artist: artistTemplate,
};

export function getTemplate(key: TemplateKey): SiteTemplate {
  return templates[key] || freelancerTemplate;
}
