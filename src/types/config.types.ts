import * as pulumi from "@pulumi/pulumi";

export interface GcpConfig {
  project: string;
  region: string;
}

export interface DatabaseConfig {
  name: string;
  user: string;
  tier: string;
  version: string;
  storageSize: number;
}

export interface CloudRunConfig {
  serviceName: string;
  serviceAccountName: string;
  cpu: string;
  memory: string;
  maxInstances: number;
  containerPort: number;
}

export interface DeploymentConfig {
  gcp: GcpConfig;
  db: DatabaseConfig;
  cloudRun: CloudRunConfig;
  timezone: string;
  allowUnauthenticated: boolean;
}

export type PulumiDependency = pulumi.Resource;
