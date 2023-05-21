namespace NodeJS {
  interface ProcessEnv {
    GOOGLE_CLIENT_ID: string;
    GOOGLE_CLIENT_SECRET: string;

    AAD_ENABLED?: 'true';
    AAD_CLIENT_ID?: string;
    AAD_CLIENT_SECRET?: string;
    /**
     * To be provided only if users should be limited to tenant
     */
    AAD_TENANT_ID?: string;
  }
}
