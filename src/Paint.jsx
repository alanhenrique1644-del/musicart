import { useId } from 'react'

const strokes = [
  { path: 'M 1196 -56 C 1057 17 1087 112 909 161 S 744 149 585 210', width: 159, color: '#5627a8' },
  { path: 'M 1270 -34 C 1091 31 1119 96 951 143 S 769 142 622 208', width: 114, color: '#7e42cd' },
  { path: 'M 1269 5 C 1109 42 1127 112 938 158 S 779 155 623 216', width: 28, color: '#bb70d9' },
  { path: 'M 1240 81 C 1140 94 1072 161 909 190 S 733 179 660 233', width: 18, color: '#4b2389' },
  { path: 'M 1309 448 C 1123 375 1074 501 899 547 S 754 595 640 678', width: 165, color: '#a52351' },
  { path: 'M 1293 439 C 1142 395 1066 489 895 524 S 714 585 612 664', width: 106, color: '#da494d' },
  { path: 'M 1278 418 C 1130 402 1061 470 892 519 S 719 578 615 656', width: 33, color: '#fa7658' },
  { path: 'M 1272 489 C 1131 442 1078 537 904 566 S 746 603 683 664', width: 31, color: '#702b8b' },
  { path: 'M -162 560 C -42 460 56 501 158 495 S 281 452 349 385', width: 110, color: '#362078' },
  { path: 'M -158 575 C -34 489 41 519 154 504 S 276 464 347 390', width: 51, color: '#5544b3' },
]

const bristles = [
  'M1206 -5 C1090 48 1089 112 942 154 S783 150 640 219',
  'M1186 24 C1089 94 1055 133 907 167 S749 170 627 223',
  'M1197 43 C1118 105 1043 152 927 173 S746 187 647 230',
  'M1236 451 C1094 432 1026 497 891 531 S751 571 639 646',
  'M1239 461 C1097 440 1024 504 894 540 S750 581 656 646',
  'M1228 487 C1100 455 1032 525 910 550 S770 591 676 650',
  'M-57 538 C40 505 91 525 153 510 S270 464 327 412',
]

const flecks = [
  [647, 248, 3], [673, 262, 6], [703, 236, 3], [610, 230, 2], [758, 226, 4], [789, 242, 2],
  [580, 622, 6], [605, 600, 3], [629, 619, 5], [724, 540, 5], [790, 513, 3], [820, 495, 5],
  [288, 497, 4], [319, 471, 2], [357, 430, 5], [371, 394, 3], [269, 505, 2],
]

export default function Paint({ className }) {
  const id = useId()
  return (
    <svg className={className} viewBox="0 0 1200 680" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
      <defs>
        <filter id={id} x="-12%" y="-16%" width="124%" height="132%" colorInterpolationFilters="sRGB">
          <feTurbulence type="fractalNoise" baseFrequency=".035 .12" numOctaves="3" seed="12" result="grain" />
          <feDisplacementMap in="SourceGraphic" in2="grain" scale="25" xChannelSelector="R" yChannelSelector="G" result="rough" />
          <feTurbulence type="fractalNoise" baseFrequency=".29 .85" numOctaves="2" seed="7" result="paper" />
          <feColorMatrix in="paper" type="saturate" values="0" result="paperGray" />
          <feBlend in="rough" in2="paperGray" mode="soft-light" />
          <feComposite in2="rough" operator="in" />
        </filter>
      </defs>
      <g filter={`url(#${id})`} fill="none" strokeLinecap="round">
        {strokes.map(({ path, width, color }) => <path key={path} d={path} stroke={color} strokeWidth={width} />)}
        {bristles.map((path, index) => <path key={path} d={path} stroke={index < 3 ? '#f0a8f2' : '#ffb08d'} strokeWidth={index % 3 + 1} opacity=".36" />)}
      </g>
      {flecks.map(([x, y, size]) => <ellipse key={x} cx={x} cy={y} rx={size} ry={size * 0.72} transform={`rotate(-22 ${x} ${y})`} fill={y > 390 ? '#e75e66' : '#b963df'} opacity=".67" />)}
    </svg>
  )
}
