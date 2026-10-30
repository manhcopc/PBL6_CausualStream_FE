import { CausalStreamApiRepository } from '@/adapters/repositories/CausalStreamApiRepository';
import { appConfig } from '@/infrastructure/config/appConfig';
import { HttpClient } from '@/infrastructure/http/HttpClient';

const httpClient = new HttpClient(appConfig.apiBaseUrl, appConfig.requestTimeoutMs);

export const causalStreamRepository = new CausalStreamApiRepository(httpClient);
