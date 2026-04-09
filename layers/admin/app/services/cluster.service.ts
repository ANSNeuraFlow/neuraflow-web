import { useApi } from '#layers/core/app/composables/useApi';

import { clusterOverviewDto } from '../dtos/cluster.dto';
import type { ClusterOverview } from '../models/cluster-api.domain';

export const useClusterService = () => {
  const { get } = useApi();

  const getClusterOverview = async (): Promise<ClusterOverview> => {
    const response = await get<ClusterOverview>('/cluster');
    return clusterOverviewDto.parse(response);
  };

  return { getClusterOverview };
};
