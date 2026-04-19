export type DeploymentStatus = 'PENDING' | 'STARTING' | 'RUNNING' | 'STOPPING' | 'STOPPED' | 'FAILED';

export type ModelDeployment = {
  id: string;
  userId: string;
  mlModelId: string;
  status: DeploymentStatus;
  rayAppName: string | null;
  serveEndpointUrl: string | null;
  errorMessage: string | null;
  startedAt: string | null;
  stoppedAt: string | null;
  createdAt: string;
  updatedAt: string;
};
