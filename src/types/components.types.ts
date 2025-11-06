import * as pulumi from "@pulumi/pulumi";
import * as gcp from "@pulumi/gcp";
import * as random from "@pulumi/random";

export interface ProjectServicesResources {
  runApi: gcp.projects.Service;
  sqlAdminApi: gcp.projects.Service;
  secretManagerApi: gcp.projects.Service;
  resourceManagerApi: gcp.projects.Service;
}

export interface ServiceAccountResources {
  account: gcp.serviceaccount.Account;
  sqlClientRole: gcp.projects.IAMMember;
}

export interface DatabaseResources {
  password: random.RandomPassword;
  instance: gcp.sql.DatabaseInstance;
  database: gcp.sql.Database;
  user: gcp.sql.User;
}

export interface SecretsResources {
  dbPasswordSecret: gcp.secretmanager.Secret;
  dbPasswordSecretVersion: gcp.secretmanager.SecretVersion;
  encryptionKeySecret: gcp.secretmanager.Secret;
  encryptionKeySecretVersion: gcp.secretmanager.SecretVersion;
  encryptionKey: random.RandomPassword;
  dbPasswordSecretAccessor: gcp.secretmanager.SecretIamMember;
  encryptionKeySecretAccessor: gcp.secretmanager.SecretIamMember;
}

export interface CloudRunServiceResources {
  service: gcp.cloudrunv2.Service;
  publicInvoker?: gcp.cloudrunv2.ServiceIamMember;
  serviceHost: pulumi.Output<string>;
  serviceUrl: pulumi.Output<string>;
}
