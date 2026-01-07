export type PeriodType = "1M" | "3M" | "6M" | "1Y" | "ALL";

export interface PeriodOption {
  value: PeriodType;
  label: string;
}

export interface ChartLineConfig {
  dataKey: string;
  name: string;
  stroke: string;
  strokeWidth?: number;
  strokeDasharray?: string;
  dot?: {
    fill?: string;
    strokeWidth?: number;
    r?: number;
  };
  activeDot?: {
    r?: number;
    strokeWidth?: number;
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type BaseChartData = Record<string, any> & {
  label: string;
};

export interface ReusableLineChartProps {
  data: BaseChartData[];
  lines: ChartLineConfig[];
  title?: string;
  titleIcon?: React.ReactNode;
  height?: number;
  showLegend?: boolean;
  showPeriodSelector?: boolean;
  selectedPeriod?: PeriodType;
  onPeriodChange?: (period: PeriodType) => void;
  emptyMessage?: string;
  noPeriodDataMessage?: string;
  xAxisDataKey?: string;
  yAxisDomain?: [string | number, string | number];
  yAxisWidth?: number;
  yAxisFormatter?: (value: number) => string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  customTooltip?: (props: any) => React.ReactNode;
  legendFormatter?: (value: string) => React.ReactNode;
  className?: string;
}
