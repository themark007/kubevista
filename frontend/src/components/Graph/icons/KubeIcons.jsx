export function KubeIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M32 4L56 18V46L32 60L8 46V18L32 4Z" stroke="url(#kube-grad)" strokeWidth="2" fill="rgba(0,212,255,0.05)" />
      <circle cx="32" cy="32" r="8" stroke="var(--neon-cyan)" strokeWidth="1.5" fill="rgba(0,212,255,0.1)" />
      <path d="M32 24V14M32 40V50M24 28L16 22M40 28L48 22M24 36L16 42M40 36L48 42" stroke="var(--neon-cyan)" strokeWidth="1.5" />
      <circle cx="32" cy="14" r="2" fill="var(--neon-cyan)" />
      <circle cx="32" cy="50" r="2" fill="var(--neon-cyan)" />
      <circle cx="16" cy="22" r="2" fill="var(--neon-cyan)" />
      <circle cx="48" cy="22" r="2" fill="var(--neon-cyan)" />
      <circle cx="16" cy="42" r="2" fill="var(--neon-cyan)" />
      <circle cx="48" cy="42" r="2" fill="var(--neon-cyan)" />
      <defs>
        <linearGradient id="kube-grad" x1="8" y1="4" x2="56" y2="60">
          <stop offset="0%" stopColor="var(--neon-cyan)" />
          <stop offset="100%" stopColor="var(--neon-green)" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function PodIcon({ size = 24, color = 'var(--neon-green)' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <rect x="2" y="2" width="28" height="28" rx="6" stroke={color} strokeWidth="1.5" fill={`${color}15`} />
      <circle cx="16" cy="16" r="5" stroke={color} strokeWidth="1.5" fill={`${color}20`} />
      <circle cx="16" cy="16" r="2" fill={color} />
    </svg>
  );
}

export function DeploymentIcon({ size = 24, color = 'var(--neon-cyan)' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <rect x="2" y="2" width="28" height="28" rx="6" stroke={color} strokeWidth="1.5" fill={`${color}15`} />
      <polygon points="16,8 24,16 16,24 8,16" stroke={color} strokeWidth="1.5" fill={`${color}20`} />
      <circle cx="16" cy="16" r="2.5" fill={color} />
    </svg>
  );
}

export function ServiceIcon({ size = 24, color = 'var(--neon-purple)' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <polygon points="16,2 30,10 30,22 16,30 2,22 2,10" stroke={color} strokeWidth="1.5" fill={`${color}15`} />
      <circle cx="16" cy="16" r="4" stroke={color} strokeWidth="1.5" fill={`${color}20`} />
      <path d="M16 12V8M20 16H24M16 20V24M12 16H8" stroke={color} strokeWidth="1.2" />
    </svg>
  );
}

export function IngressIcon({ size = 24, color = 'var(--neon-pink)' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <path d="M4 16C4 9.4 9.4 4 16 4C22.6 4 28 9.4 28 16C28 22.6 22.6 28 16 28" stroke={color} strokeWidth="1.5" fill={`${color}10`} />
      <path d="M4 16H28M16 4C12 8 10 12 10 16C10 20 12 24 16 28M16 4C20 8 22 12 22 16C22 20 20 24 16 28" stroke={color} strokeWidth="1" opacity="0.5" />
      <path d="M4 12H28M4 20H28" stroke={color} strokeWidth="0.8" opacity="0.3" />
      <circle cx="16" cy="16" r="3" fill={color} opacity="0.6" />
    </svg>
  );
}

export function ConfigMapIcon({ size = 24, color = 'var(--neon-gold)' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <rect x="4" y="2" width="22" height="28" rx="3" stroke={color} strokeWidth="1.5" fill={`${color}10`} />
      <path d="M10 10H22M10 15H22M10 20H18" stroke={color} strokeWidth="1.2" opacity="0.6" />
      <rect x="7" y="5" width="4" height="4" rx="1" fill={color} opacity="0.4" />
    </svg>
  );
}

export function SecretIcon({ size = 24, color = 'var(--neon-gold)' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <rect x="4" y="14" width="24" height="16" rx="3" stroke={color} strokeWidth="1.5" fill={`${color}10`} />
      <path d="M10 14V10C10 6.7 12.7 4 16 4C19.3 4 22 6.7 22 10V14" stroke={color} strokeWidth="1.5" fill="none" />
      <circle cx="16" cy="22" r="2.5" fill={color} />
      <path d="M16 24.5V27" stroke={color} strokeWidth="1.5" />
    </svg>
  );
}

export function NamespaceIcon({ size = 24, color = 'var(--neon-blue)' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <rect x="2" y="2" width="28" height="28" rx="4" stroke={color} strokeWidth="1.5" strokeDasharray="4 3" fill="none" />
      <text x="16" y="18" textAnchor="middle" fill={color} fontSize="10" fontWeight="600" fontFamily="var(--font-sans)">NS</text>
    </svg>
  );
}

const ICON_MAP = {
  Pod: PodIcon,
  Deployment: DeploymentIcon,
  Service: ServiceIcon,
  Ingress: IngressIcon,
  ConfigMap: ConfigMapIcon,
  Secret: SecretIcon,
  Namespace: NamespaceIcon,
};

export function ResourceIcon({ kind, size = 24 }) {
  const Icon = ICON_MAP[kind];
  return Icon ? <Icon size={size} /> : <PodIcon size={size} color="var(--text-muted)" />;
}
