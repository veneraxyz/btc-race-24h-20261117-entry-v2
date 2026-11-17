# DIPLINE v2 — Strategy

## Rule

Long-only cbBTC/USDC, 1-minute bars, $1,000 paper, one open position.

- **Buy** the full cash stack when the close is >= 150 bps below the trailing
  360-bar high of closes (361 closes, current bar included). Needs 361 closes
  of history, so the first buy can fire at bar 360 at the earliest.
- **Sell** the whole position when the close reaches +150 bps take-profit or
  -75 bps stop-loss, measured from the decision close of the buy bar.
- **Late bank:** from bar 1300 on, sell when the close is up >= 75 bps
  (half the take-profit). A position held that late has usually missed its
  take-profit; banking a half win beats riding it into the forced flatten.
- **Backstop:** if flat at bar 1200, buy the full stack — the run always
  trades at least once.
- **Fills:** orders decided on bar k fill at bar k+1's open. Max slippage
  100 bps from the latest close. All comparisons are exact bigint arithmetic
  on raw integer prices. No clock, no randomness, no environment reads, so
  two executions are byte-identical.

## Why this, and what was rejected

A 625-combination grid over lookback (240–480), dip (100–200 bps), TP
(100–200 bps) and SL (50–100 bps) showed the window is saturated for this
family: the best grid point (lookback 420) scored +27.71 vs +27.46 for the
v1 parameters, and its edge was a warm-up artifact (it missed the first dip
and accidentally bought lower later) with a worse bootstrap median — not a
real improvement. Structural variants all lost on the dev window or on
robustness: entry from the fill price (+15.21, reversed negative), dip vs
bar highs (+14.77), bounce confirmation (+22.53), max-hold exits (+4.03 to
+20.84), partial take-profits (+19.21 to +23.89), average-down scale-ins
(+15.46 to +21.25), tighter dips (dip 125: +9.96; dip 100: -3.96).

The late bank is the one refinement that adds real PnL: v1's third trade
bought at bar 1099, peaked at +96 bps and was flattened at the end for
+1.36 USDC after 340 bars. Banking it at +75 bps once bar 1300 passed adds
+3.84 USDC. The rule is plateau-stable, not a tuned spike: start bars
1200–1400 with floors +50–75 bps all beat v1 on the dev window.

## Evidence (dev window, 1,440 bars)

- Local sim (fill model reimplemented from RULES.txt, validated by
  reproducing v1's grade-local +27.46 exactly): **+31.30 USDC, 6 trades,
  max drawdown 0.77%**.
- Reversed-time run: **+2.11 USDC** (positive).
- Dev halves run independently: **+14.82 / +1.39 USDC** (both positive).
- 4-hour block bootstrap, 150 resamples: median +14.56, p10 -2.90,
  23/150 at or below zero (v1: median +13.09, 33/150).
- grade-local verification of this exact code: see the build report; it
  must match the sim numbers above before submission.
