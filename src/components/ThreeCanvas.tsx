import React from 'react';
import { Language } from '../types';
import { Vehicle3DVisualization } from './vehicle3d/Vehicle3DVisualization';

interface ThreeCanvasProps {
  lang: Language;
  onSelectDtc?: () => void;
  onOpenSensor?: (sensorName: string) => void;
  initialSelectedComponentId?: string | null;
}

export const ThreeCanvas: React.FC<ThreeCanvasProps> = ({
  lang,
  onSelectDtc,
  onOpenSensor,
  initialSelectedComponentId,
}) => {
  return (
    <Vehicle3DVisualization
      lang={lang}
      onSelectDtc={onSelectDtc}
      onOpenSensor={onOpenSensor}
      initialSelectedComponentId={initialSelectedComponentId}
    />
  );
};
