import Link from '@docusaurus/Link';
import Layout from '@theme/Layout';

const FEATURES = [
  {
    icon: '>>',
    title: 'AI-Powered Agent',
    description: 'Manage your cluster through natural language. Deploy apps, diagnose issues, query resources — Claude handles the kubectl.',
  },
  {
    icon: '[]',
    title: 'Resource Management',
    description: 'Browse, inspect, and edit any Kubernetes resource. Generic pages work for all types, with custom UIs for core workloads.',
  },
  {
    icon: '{}',
    title: 'OAuth2 + RBAC',
    description: 'Per-user authentication via OpenShift OAuth or OIDC. The UI adapts to your permissions — see only what you can access.',
  },
  {
    icon: '//',
    title: 'AI-Extensible',
    description: 'Add new resource pages with a single Claude Code prompt. The codebase is designed for AI-driven development from the ground up.',
  },
  {
    icon: '<>',
    title: 'Modern Stack',
    description: 'Next.js 15 + Python FastAPI + Tailwind CSS. React Query for real-time data, Zustand for state, Monaco for YAML editing.',
  },
  {
    icon: '&&',
    title: 'Production Ready',
    description: 'Multi-stage Docker builds, Kubernetes manifests, OpenShift BuildConfigs. Deploy with a single slash command.',
  },
];

function HeroSection() {
  return (
    <header className="kb-hero">
      <div className="container kb-hero-content">
        <div className="kb-badge">
          <span className="kb-badge-dot" />
          Open Source &middot; AI-Native &middot; Kubernetes
        </div>

        <h1 className="kb-title">
          <span className="kb-title-gradient">Kubosun</span>
        </h1>

        <p className="kb-subtitle">
          The AI-native Kubernetes console. Manage clusters through a modern UI
          and natural language — powered by Claude.
        </p>

        <div className="kb-cta-group">
          <Link className="kb-cta-primary" to="/docs/getting-started/quick-start">
            Get Started &rarr;
          </Link>
          <Link className="kb-cta-secondary" href="https://github.com/kubosun/console">
            View on GitHub
          </Link>
        </div>

        {/* Terminal Preview */}
        <div className="kb-terminal">
          <div className="kb-terminal-header">
            <span className="kb-terminal-dot" style={{background: '#ff5f57'}} />
            <span className="kb-terminal-dot" style={{background: '#febc2e'}} />
            <span className="kb-terminal-dot" style={{background: '#28c840'}} />
          </div>
          <div className="kb-terminal-body">
            <div><span className="kb-terminal-prompt">kubosun&gt; </span><span className="kb-terminal-cmd">How many pods are crashing in production?</span></div>
            <div className="kb-terminal-output" style={{marginTop: '0.5rem'}}>Checking pods across all namespaces...</div>
            <div className="kb-terminal-output" style={{opacity: 0.35, fontSize: '0.75rem'}}>list_resources &middot; get_pod_logs &middot; get_events</div>
            <div style={{marginTop: '0.5rem'}}><span className="kb-terminal-success">Found 2 pods in CrashLoopBackOff:</span></div>
            <div className="kb-terminal-output">&nbsp; api-server-7f8b (OOMKilled, 12 restarts)</div>
            <div className="kb-terminal-output">&nbsp; worker-9c4d (ImagePullBackOff, missing tag v2.1)</div>
          </div>
        </div>
      </div>
    </header>
  );
}

function FeaturesSection() {
  return (
    <section className="kb-features">
      <div className="container">
        <div className="kb-features-header">
          <h2>Built for the AI era</h2>
          <p>Everything you need to manage Kubernetes — and extend it with a prompt.</p>
        </div>
        <div className="kb-features-grid">
          {FEATURES.map((feature, idx) => (
            <div key={idx} className="kb-feature-card">
              <div className="kb-feature-icon" style={{fontFamily: "'IBM Plex Mono', monospace", fontWeight: 700, fontSize: '1rem', color: 'var(--kb-accent)'}}>
                {feature.icon}
              </div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ArchitectureSection() {
  return (
    <section className="kb-arch">
      <div className="container">
        <div className="kb-arch-header">
          <h2>Architecture</h2>
        </div>
        <div className="kb-arch-diagram">
          <div className="kb-arch-box">
            <div className="kb-arch-box-label">Frontend</div>
            <h4>Next.js + React</h4>
            <ul>
              <li>Dashboard</li>
              <li>Resource Pages</li>
              <li>YAML Editor</li>
              <li>AI Chat Panel</li>
            </ul>
          </div>
          <div className="kb-arch-arrow">HTTP &rarr;<br/>&larr; SSE</div>
          <div className="kb-arch-box" style={{borderColor: 'rgba(56, 189, 248, 0.2)'}}>
            <div className="kb-arch-box-label">Backend</div>
            <h4>Python FastAPI</h4>
            <ul>
              <li>K8s Proxy</li>
              <li>AI Agent (Claude)</li>
              <li>OAuth2 / RBAC</li>
              <li>API Discovery</li>
            </ul>
          </div>
          <div className="kb-arch-arrow">HTTPS &rarr;<br/>&larr; Watch</div>
          <div className="kb-arch-box">
            <div className="kb-arch-box-label">Cluster</div>
            <h4>Kubernetes API</h4>
            <ul>
              <li>API Server</li>
              <li>OAuth Server</li>
              <li>CRDs + Operators</li>
              <li>Workloads</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

function CTASection() {
  return (
    <section className="kb-cta-section">
      <div className="container" style={{position: 'relative', zIndex: 1}}>
        <h2>Ready to try Kubosun?</h2>
        <p>Get started in minutes with Docker Compose or deploy to your OpenShift cluster.</p>
        <div className="kb-cta-group">
          <Link className="kb-cta-primary" to="/docs/getting-started/quick-start">
            Quick Start Guide &rarr;
          </Link>
          <Link className="kb-cta-secondary" to="/docs/architecture/overview">
            Read the Docs
          </Link>
        </div>
      </div>
    </section>
  );
}

export default function Home(): JSX.Element {
  return (
    <Layout description="AI-native Kubernetes console powered by Claude. Manage clusters through UI and natural language.">
      <HeroSection />
      <main>
        <FeaturesSection />
        <ArchitectureSection />
        <CTASection />
      </main>
    </Layout>
  );
}
