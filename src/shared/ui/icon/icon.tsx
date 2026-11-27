import Svg, { Circle, Path, Rect } from 'react-native-svg';

import { ICONS, type IconName } from './icons';

interface IconProps {
  name: IconName;
  /** 24 (tab bar, ações), 18 (dentro de botão), 14 (dentro de chip). */
  size?: number;
  color: string;
  /** Largura explícita para formas não quadradas (silhueta 64×40); aceita %. */
  width?: number | `${number}%`;
  height?: number | `${number}%`;
}

/** Ícone do design system renderizado em SVG com a cor do tema (nunca emoji). */
export function Icon({ name, size = 24, color, width, height }: IconProps) {
  const def = ICONS[name];
  const isStroke = def.paint === 'stroke';
  const common = isStroke
    ? {
        fill: 'none',
        stroke: color,
        strokeWidth: 1.75,
        strokeLinecap: 'round' as const,
        strokeLinejoin: 'round' as const,
      }
    : { fill: color };

  return (
    <Svg
      width={width ?? size}
      height={height ?? size}
      viewBox={def.viewBox}
      aria-hidden
    >
      {def.shapes.map((shape, i) => {
        switch (shape.kind) {
          case 'path':
            return (
              <Path
                key={i}
                d={shape.d}
                {...common}
                {...(shape.strokeWidth !== undefined
                  ? { strokeWidth: shape.strokeWidth, stroke: color, strokeLinejoin: 'round' as const }
                  : null)}
              />
            );
          case 'circle':
            return <Circle key={i} cx={shape.cx} cy={shape.cy} r={shape.r} {...common} />;
          case 'rect':
            return (
              <Rect
                key={i}
                x={shape.x}
                y={shape.y}
                width={shape.width}
                height={shape.height}
                rx={shape.rx}
                {...common}
              />
            );
        }
      })}
    </Svg>
  );
}
