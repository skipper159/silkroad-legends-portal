import { ComponentType, ReactNode } from 'react';

export interface TemplateComponents {
  Layout: React.ComponentType<{ children: React.ReactNode }>;
  AuthLayout?: React.ComponentType<{ children: React.ReactNode }>;
  Header: React.ComponentType;
  Footer: React.ComponentType;
  ServerStatusWidget: React.ComponentType;
  HeroSection: React.ComponentType;
  NewsSection: React.ComponentType;
  RankingPreviewSection: React.ComponentType;
  FeaturesSection: React.ComponentType;
  PageBanner?: React.ComponentType<{
    title?: string;
    subtitle?: string;
    children?: React.ReactNode;
    className?: string;
  }>;
}

export interface TemplateAssets {
  logo: string;
  loginBackground: string;
  registerBackground: string;
  pageHeaderBackground: string; // Default fallback for headers
  sidebarBackground?: string;
  globalBackground?: string; // App-wide background
  heroContainerBackground?: string; // Specific for Hero Section wrapper
  // Page Specific Headers
  accountHeaderBackground?: string;
  adminHeaderBackground?: string;
  serverInfoHeaderBackground?: string;
  newsHeaderBackground?: string;
  rankingsHeaderBackground?: string;
  downloadHeaderBackground?: string;
  guideHeaderBackground?: string;
  cardGradient?: string;
}

export type ConfigFieldType = 'image' | 'text' | 'textarea' | 'color' | 'number' | 'boolean';

export interface TemplateConfigField {
  key: keyof TemplateAssets | string;
  label: string;
  type: ConfigFieldType;
  section: 'branding.images' | 'branding.text';
  description?: string;
}

export interface TemplateDefinition {
  metadata: {
    name: string;
    version: string;
    description: string;
    author: string;
  };
  components: TemplateComponents;
  assets: TemplateAssets;
  customizationConfig?: TemplateConfigField[];
}
