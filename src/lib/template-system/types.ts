import { ComponentType, ReactNode } from 'react';

export interface TemplateComponents {
  // Core Layout
  Layout: ComponentType<{ children: ReactNode }>;
  Header: ComponentType;
  Footer: ComponentType;

  // Widgets / Sections
  ServerStatusWidget: ComponentType;
  HeroSection: ComponentType;
  NewsSection: ComponentType<{ limit?: number }>;
  RankingPreviewSection: ComponentType;
  FeaturesSection: ComponentType;

  // UI Elements (Optional overrides, otherwise use Shadcn/Default)
  // Loader?: ComponentType;
}

export interface TemplateAssets {
  logo: string;
  loginBackground: string;
  registerBackground: string;
  pageHeaderBackground: string; // For News, Rankings etc. headers
  cardGradient?: string; // Optional CSS class or background value
}

export interface TemplateDefinition {
  metadata: {
    name: string;
    version: string;
    description?: string;
    author?: string;
  };
  components: TemplateComponents;
  assets: TemplateAssets;
}
