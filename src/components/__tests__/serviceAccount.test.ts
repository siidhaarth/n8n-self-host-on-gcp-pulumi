import * as pulumi from "@pulumi/pulumi";
import * as gcp from "@pulumi/gcp";

import { createServiceAccount } from "../serviceAccount";

interface RecordedResource extends pulumi.runtime.MockResourceArgs {}

const recordedResources: RecordedResource[] = [];

const resolveOutput = async <T>(output: pulumi.Output<T>): Promise<T> =>
  new Promise<T>((resolve) => {
    output.apply((value) => {
      resolve(value);
      return value;
    });
  });

beforeAll(() => {
  pulumi.runtime.setMocks(
    {
      newResource: (args) => {
        recordedResources.push(args);

        if (args.type === "gcp:serviceaccount/account:Account") {
          const accountId = typeof args.inputs.accountId === "string" ? args.inputs.accountId : args.name;

          return {
            id: `${args.name}-id`,
            state: {
              ...args.inputs,
              email: `${accountId}@test-project.iam.gserviceaccount.com`,
            },
          };
        }

        return {
          id: `${args.name}-id`,
          state: {
            ...args.inputs,
          },
        };
      },
      call: () => ({}),
    },
    "test-project",
    "dev"
  );
});

beforeEach(() => {
  recordedResources.length = 0;
});

describe("createServiceAccount", () => {
  it("creates service account and assigns Cloud SQL client role", async () => {
    const results = (await pulumi.runtime.runInPulumiStack(async () => {
      const resources = createServiceAccount({
        project: "test-project",
        accountId: "n8n-service-account",
        displayName: "n8n Service Account",
      });

      const accountEmail = await resolveOutput(resources.account.email);
      const member = await resolveOutput(resources.sqlClientRole.member);

      return { accountEmail, member };
    })) as { accountEmail: string; member: string };

    expect(results.accountEmail).toBe("n8n-service-account@test-project.iam.gserviceaccount.com");
    expect(results.member).toBe(`serviceAccount:${results.accountEmail}`);

    const accountResource = recordedResources.find((res) => res.type === "gcp:serviceaccount/account:Account");
    expect(accountResource).toBeDefined();
    expect(accountResource!.name).toBe("n8nServiceAccount");
    expect(accountResource!.inputs.project).toBe("test-project");
    expect(accountResource!.inputs.accountId).toBe("n8n-service-account");
    expect(accountResource!.inputs.displayName).toBe("n8n Service Account");

    const sqlClientRoleResource = recordedResources.find((res) => res.type === "gcp:projects/iAMMember:IAMMember");
    expect(sqlClientRoleResource).toBeDefined();
    expect(sqlClientRoleResource!.name).toBe("sqlClientRole");
    expect(sqlClientRoleResource!.inputs.project).toBe("test-project");
    expect(sqlClientRoleResource!.inputs.role).toBe("roles/cloudsql.client");
    expect(sqlClientRoleResource!.inputs.member).toBe("serviceAccount:n8n-service-account@test-project.iam.gserviceaccount.com");
  });
});
