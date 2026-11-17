// DIPLINE v2 — long-only cbBTC dip bot with a late-window profit bank.
//
// Idea: cbBTC mean-reverts after sharp intraday dips. Buy the whole cash stack
// when the close falls 150 bps below the trailing 360-bar high of closes, then
// exit the whole position at +150 bps take-profit or -75 bps stop-loss, both
// measured from the decision close. Late in the window (bar 1300 on) bank any
// position that is up 75 bps instead of holding it into the forced flatten:
// a bird in the hand beats a round trip that never reaches take-profit. A
// backstop buy at bar 1200 guarantees at least one trade when no dip ever
// fired. Every comparison is exact bigint arithmetic on raw prices; no clock,
// no randomness, no environment — two runs are byte-identical.

import { runBars } from './vendor/makefun-bars.ts';
import type { BarsState, Batch, OrderInput } from './vendor/makefun-bars.ts';

const SYMBOL = 'CBBTC';
const BPS = 10000n;

// Strategy parameters, all in basis points unless noted.
const LOOKBACK_BARS = 360; // trailing-high window (361 closes, current included)
const DIP_BPS = 150n; // buy when the close is this far below the trailing high
const TAKE_BPS = 150n; // take-profit above the entry close
const STOP_BPS = 75n; // stop-loss below the entry close
const BANK_BAR = 1300; // from this bar on, bank a half-TP profit
const BANK_BPS = 75n; // profit banked late in the window
const BACKSTOP_BAR = 1200; // buy here if flat, so the run always trades
const MAX_SLIP_BPS = 100; // cap on fill move from the latest close

// Closes seen so far, oldest first; the entry reference of the open position.
const closes: bigint[] = [];
let entryClose: bigint | null = null;
let pendingClose: bigint | null = null;

function trailingPeak(): bigint {
  let peak = closes[closes.length - 1];
  for (let i = closes.length - 2; i >= closes.length - 1 - LOOKBACK_BARS; i--) {
    if (closes[i] > peak) peak = closes[i];
  }
  return peak;
}

// Shift a price by signed basis points, truncating toward zero.
function shifted(price: bigint, bps: bigint): bigint {
  return (price * (BPS + bps)) / BPS;
}

function onBatch(state: BarsState, _batch: Batch): OrderInput[] {
  const close = state.close(SYMBOL);
  if (close === null) return [];
  closes.push(close);
  if (state.warmingUp) return [];

  const held = state.positions.get(SYMBOL);
  const qty = held === undefined ? 0n : held.qty;

  if (qty > 0n) {
    if (entryClose === null) {
      entryClose = pendingClose;
      pendingClose = null;
    }
    if (entryClose !== null) {
      const takeAt = shifted(entryClose, TAKE_BPS);
      const stopAt = shifted(entryClose, -STOP_BPS);
      const bankAt = shifted(entryClose, BANK_BPS);
      const bankNow = state.seq >= BANK_BAR && close >= bankAt;
      if (close >= takeAt || close <= stopAt || bankNow) {
        entryClose = null;
        return [{ side: 'sell', symbol: SYMBOL, qty, max_slippage_bps: MAX_SLIP_BPS }];
      }
    }
    return [];
  }

  // Flat: a buy decided earlier never filled, so forget it and re-decide.
  entryClose = null;
  pendingClose = null;

  let buy = false;
  if (closes.length > LOOKBACK_BARS) {
    const peak = trailingPeak();
    if (close <= shifted(peak, -DIP_BPS)) buy = true;
  }
  if (!buy && state.seq === BACKSTOP_BAR) buy = true;
  if (buy && state.cash > 0n) {
    pendingClose = close;
    return [{ side: 'buy', symbol: SYMBOL, notional_quote_units: state.cash, max_slippage_bps: MAX_SLIP_BPS }];
  }
  return [];
}

await runBars({ onBatch });
