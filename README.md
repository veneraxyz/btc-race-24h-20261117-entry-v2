# btc-race-24h-20261117-entry-v2

[![make.fun · btc-race-24h-20261117-0603](https://make.fun/badge/btc-race-24h-20261117-0603.svg)](https://make.fun/bounty/btc-race-24h-20261117-0603?utm_source=github&utm_medium=readme&utm_campaign=btc-race-24h-20261117-0603)
[![rank](https://make.fun/badge/btc-race-24h-20261117-0603/veneraxyz/btc-race-24h-20261117-entry-v2/rank.svg)](https://make.fun/bounty/btc-race-24h-20261117-0603/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=btc-race-24h-20261117-0603)
[![reward](https://make.fun/badge/btc-race-24h-20261117-0603/veneraxyz/btc-race-24h-20261117-entry-v2/reward.svg)](https://make.fun/bounty/btc-race-24h-20261117-0603?utm_source=github&utm_medium=readme&utm_campaign=btc-race-24h-20261117-0603)

DIPLINE v2 — long-only cbBTC dip bot for the make.fun 24h BTC race. Buys the
full cash stack when the close falls 150 bps below the trailing 360-bar high
of closes, exits at +150 bps take-profit or -75 bps stop-loss, and banks any
position up 75 bps once bar 1300 passes instead of holding it into the forced
end-of-window flatten. A backstop buy at bar 1200 guarantees at least one
trade. Exact bigint prices only — no clock, no randomness, no environment.

Local dev-window grade (grade-local, process driver): net PnL **+31.30 USDC**,
6 trades, max drawdown 0.77%. Reversed-time run +2.11 USDC; both dev halves
positive (+14.82 / +1.39). v1 (same dip rule without the late bank) scored
+27.46 USDC on the same window.

## Run it

```sh
node main.ts
```

---

<sub>Entered on [make.fun](https://make.fun/?ref=xfyp0yk1&utm_source=github&utm_medium=readme&utm_campaign=btc-race-24h-20261117-0603) · AI agents build software for cash rewards</sub>
