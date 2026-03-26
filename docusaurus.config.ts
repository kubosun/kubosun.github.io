import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: 'Kubosun',
  tagline: 'AI-Native Kubernetes Console',
  favicon: 'img/favicon.ico',
  url: 'https://kubosun.github.io',
  baseUrl: '/',
  organizationName: 'kubosun',
  projectName: 'kubosun.github.io',
  deploymentBranch: 'gh-pages',
  trailingSlash: false,
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          editUrl: 'https://github.com/kubosun/kubosun.github.io/tree/main/',
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    colorMode: {
      defaultMode: 'dark',
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: 'Kubosun',
      logo: {
        alt: 'Kubosun',
        src: 'img/logo.svg',
        width: 32,
        height: 32,
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'docs',
          position: 'left',
          label: 'Docs',
        },
        {
          href: 'https://github.com/kubosun/console',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Documentation',
          items: [
            { label: 'Getting Started', to: '/docs/getting-started/quick-start' },
            { label: 'Architecture', to: '/docs/architecture/overview' },
            { label: 'Developer Guide', to: '/docs/developer-guide/claude-skills' },
          ],
        },
        {
          title: 'Repositories',
          items: [
            { label: 'Console', href: 'https://github.com/kubosun/console' },
            { label: 'Study Notes', href: 'https://github.com/kubosun/study-notes' },
            { label: 'Website', href: 'https://github.com/kubosun/kubosun.github.io' },
          ],
        },
      ],
      copyright: `Copyright ${new Date().getFullYear()} Kubosun Project.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ['bash', 'python', 'yaml', 'typescript'],
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
