export type ClusterNodeCpu = {
  usagePercent: number | null;
};

export type ClusterNodeMemory = {
  usedBytes: number | null;
  totalBytes: number | null;
  usedPercent: number | null;
};

export type ClusterNodeDisk = {
  usedBytes: number | null;
  totalBytes: number | null;
  usedPercent: number | null;
};

export type ClusterNode = {
  id: string;
  address: string;
  role: 'master' | 'worker';
  isOnline: boolean;
  cpu: ClusterNodeCpu;
  memory: ClusterNodeMemory;
  disk: ClusterNodeDisk;
};

export type ClusterSummary = {
  totalNodes: number;
  onlineNodes: number;
  offlineNodes: number;
  cpu: ClusterNodeCpu;
  memory: ClusterNodeMemory;
  disk: ClusterNodeDisk;
};

export type ClusterOverview = {
  nodes: ClusterNode[];
  summary: ClusterSummary;
  fetchedAt: string;
};
