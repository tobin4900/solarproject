import { nanoid } from 'nanoid';

export const generateSceneId = (): string => {
  return nanoid(10);
};

export const isValidSceneId = (id: string): boolean => {
  return /^[a-zA-Z0-9_-]{10}$/.test(id);
};