import output from '../../output-manager';
import type Client from '../client';
import type { InstallationBalancesAndThresholds } from './types';

export async function fetchInstallationPrepaymentInfo(
  client: Client,
  teamId: string,
  installationId: string
): Promise<InstallationBalancesAndThresholds> {
  return await client.fetch<InstallationBalancesAndThresholds>(
    `/v1/integrations/installations/${installationId}/billing/balance?teamId=${teamId}`,
    {
      json: true,
    }
  );
}

export async function getBalanceInformation(
  client: Client,
  installationId: string,
  team: { id: string }
) {
  output.spinner('Retrieving balance info…', 500);
  try {
    const prepaymentInfo = await fetchInstallationPrepaymentInfo(
      client,
      team.id,
      installationId
    );

    output.stopSpinner();

    if (!prepaymentInfo) {
      output.error('No balance information found for this integration');
      return;
    }

    return prepaymentInfo;
  } catch (error) {
    output.stopSpinner();
    output.error(`Failed to fetch balance info: ${(error as Error).message}`);
    return;
  }
}
