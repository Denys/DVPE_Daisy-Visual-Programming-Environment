import { BlockDefinition } from '@/types';
import { CustomBlockDefinition } from '@/types/customBlock';

export type NodeDoubleClickAction = 'inspect' | 'inspect-custom-internals';

interface ResolveNodeDoubleClickActionInput {
  ctrlKey: boolean;
  metaKey: boolean;
  definition?: BlockDefinition | null;
}

export const isCustomBlockDefinition = (
  definition?: BlockDefinition | null
): definition is CustomBlockDefinition => {
  return Boolean(definition && (definition as Partial<CustomBlockDefinition>).isCustom === true);
};

export const resolveNodeDoubleClickAction = ({
  ctrlKey,
  metaKey,
  definition,
}: ResolveNodeDoubleClickActionInput): NodeDoubleClickAction => {
  const modifierPressed = ctrlKey || metaKey;

  if (modifierPressed && isCustomBlockDefinition(definition)) {
    return 'inspect-custom-internals';
  }

  return 'inspect';
};

