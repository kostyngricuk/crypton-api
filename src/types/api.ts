export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export type TradingSide = "Sell" | "Buy";

export type TradingType = "Market" | "Limit" | "Stop" | "StopLimit";

export type TradeStatus = "Pending" | "Active" | "Completed" | "Cancelled";

export interface Trade {
  Id: number;
  ClientId: string;
  AccountId: number;
  Type: TradingType;
  InitialType: TradingType;
  Side: TradingSide;
  Status: TradeStatus;
  Symbol: string;
  SymbolPrecision: number;
  Price: number;
  CurrentPrice: number;
  InitialAmount: number;
  RemainingAmount: number;
  FilledAmount: number;
  Margin: number;
  ImmediateOrCancel: boolean;
  MarketWithSlippage: boolean;
  FillOrKill: boolean;
  OneCancelsTheOther: boolean;
  Created: number;
  Modified: number;
  ClientApp: string;
  ContingentOrder: boolean;
}

export interface PipsValue {
  Symbol: string;
  Value: number;
}

export interface TradingTick {
  Symbol: string;
  Timestamp: number;
  BestBid: {
    Type: string;
    Price: number;
    Volume: number;
  };
  BestAsk: {
    Type: string;
    Price: number;
    Volume: number;
  };
  IndicativeTick: true;
  TickType: string;
}

export interface Symbol {
  Symbol: string;
  Precision: number;
  IsTradeAllowed: boolean;
  MarginMode: string;
  ProfitMode: string;
  ContractSize: number;
  MarginHedged: number;
  MarginFactor: number;
  MarginCurrency: string;
  MarginCurrencyPrecision: number;
  ProfitCurrency: string;
  ProfitCurrencyPrecision: number;
  Description: string;
  Schedule: string;
  Color: number;
  SwapEnabled: boolean;
  SwapType: string;
  SwapSizeShort: number;
  SwapSizeLong: number;
  TripleSwapDay: number;
  MinTradeAmount: number;
  MaxTradeAmount: number;
  TradeAmountStep: number;
  CommissionType: string;
  CommissionChargeType: string;
  Commission: number;
  LimitsCommission: number;
  MinCommission: number;
  MinCommissionCurrency: string;
  DefaultSlippage: number;
  StatusGroupId: string;
  SecurityName: string;
  SecurityDescription: string;
  StopOrderMarginReduction: number;
  HiddenLimitOrderMarginReduction: number;
  IsCloseOnly: boolean;
  IsLongOnly: boolean;
  SlippageType: string;
  ExtendedName: string;
  TradingMode: string;
}

export interface Position {
  Id: number;
  Symbol: string;
  LongAmount: number;
  LongPrice: number;
  ShortAmount: number;
  ShortPrice: number;
  Commission: number;
  AgentCommission: number;
  Swap: number;
  Modified: number;
  Margin: number;
  Profit: number;
  CurrentBestAsk: number;
  CurrentBestBid: number;
  TransferringCoefficient: number;
  Created: number;
}

export interface Asset {
  Currency: string;
  Amount: number;
  FreeAmount: number;
  LockedAmount: number;
  CurrencyToReportConversionRate: number;
  ReportToCurrencyConversionRate: number;
}

export interface ServerInfo {
  ServerName: string;
  ServerAddress: string;
}
