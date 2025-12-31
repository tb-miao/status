export type { AppConfig } from './types';
import type { AppConfig } from './types';
import config from './config';

export function getConfig(): AppConfig {
  return config;
}
