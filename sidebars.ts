import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  docs: [
    'intro',
    {
      type: 'category',
      label: 'Getting Started',
      items: ['getting-started/quick-start', 'getting-started/prerequisites', 'getting-started/configuration'],
    },
    {
      type: 'category',
      label: 'Architecture',
      items: ['architecture/overview', 'architecture/frontend', 'architecture/backend', 'architecture/ai-agent'],
    },
    {
      type: 'category',
      label: 'Developer Guide',
      items: ['developer-guide/claude-skills', 'developer-guide/adding-resources', 'developer-guide/adding-endpoints', 'developer-guide/adding-ai-tools', 'developer-guide/testing'],
    },
    {
      type: 'category',
      label: 'Deployment',
      items: ['deployment/cli', 'deployment/openshift', 'deployment/docker', 'deployment/kubernetes'],
    },
    {
      type: 'category',
      label: 'API Reference',
      items: ['api-reference/backend-api', 'api-reference/ai-tools'],
    },
  ],
};

export default sidebars;
