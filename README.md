## Getting started

- Create `.env` in project's root.
- Add `WALLET_1=WIF` in `.env`.
- Run `npm start`.
- Optionally, without .env, you can run with `WALLET_1=WIF npm start`.

## Buidling
- Run `npm run build`, to ensure that node.js could use this package natively. package.json points to build.

## Bot Config

To run bot locally, add `LOCAL=true` to `.env` and create `src/.config.local.json`.

Sample configs:

###### legend:
- run: boolean - true | false (skips command even if config is specified).
- type: string - See `src/lib/index`.
- action: string - See `src/lib/orders`, `src/lib/...`.
- params: array - Some methods requires params.

```js
{
  "wallets": ["WALLET_1"], // WALLET_1 should match env name for WIF
  "bot": {
    "single": {
      "run": true,
      "commands": [
        {
          "run": true,
          "type": "orders",
          "action": "list",
          "options": {
            "print": true // prints detailed results
          }
        },
        {
          "run": false,
          "type": "orders",
          "action": "create",
          "params": [
            {
              "pair": "SWTH_NEO",
              "blockchain": "neo",
              "side": "buy",
              "price": 0.00060008,
              "wantAmount": 16.83108918,
              "useNativeTokens": true,
              "orderType": "limit"
            }
          ],
          "options": {
            "num": 2 // loop creates
          }
        },
        {
          "run": false,
          "type": "orders",
          "action": "cancelAllOpen"
        }
      ]
    }
  }
}
```
